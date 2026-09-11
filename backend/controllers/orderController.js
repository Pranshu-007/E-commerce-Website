import crypto from 'crypto';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import { fail, ok } from '../utils/http.js';
import { safeEqual } from '../utils/crypto.js';
import { getAllowedOrigins } from '../utils/env.js';
import {
  buildServerOrder,
  CheckoutError,
  CURRENCY,
  DELIVERY_CHARGE,
  incrementCouponUse,
} from '../services/checkout.js';
import { decrementStock, restoreStock } from '../services/inventory.js';
import { sendOrderEmail } from '../services/email.js';

const ALLOWED_STATUSES = [
  'Order Placed',
  'Packing',
  'Shipped',
  'Out for delivery',
  'Delivered',
  'Cancelled',
  'Return Requested',
  'Returned',
];

const CANCELLABLE = ['Order Placed', 'Packing', 'Pending Payment'];

let stripe;
let razorpayInstance;

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    const error = new Error('Stripe is not configured');
    error.status = 503;
    throw error;
  }
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    const error = new Error('Razorpay is not configured');
    error.status = 503;
    throw error;
  }
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
}

function checkoutError(res, error) {
  if (error instanceof CheckoutError) {
    return fail(res, error.status, error.message);
  }
  console.log(error);
  return fail(res, error.status || 500, error.message || 'Request failed');
}

function checkoutOrigin(req) {
  const origin = req.headers.origin;
  const allowed = getAllowedOrigins();
  if (origin && allowed.includes(origin)) return origin;
  return allowed[0] || 'http://localhost:5173';
}

async function persistNewOrder(priced, extra) {
  await decrementStock(priced.items);

  const newOrder = new orderModel({
    ...priced,
    ...extra,
    stockReserved: true,
    date: Date.now(),
  });
  await newOrder.save();
  sendOrderEmail(priced.address?.email, newOrder).catch((err) => console.log(err));
  return newOrder;
}

async function applyCouponToOrder(order) {
  if (!order?.couponCode || order.couponCounted) return;
  await incrementCouponUse(order.couponCode);
  order.couponCounted = true;
  await order.save();
}

async function releaseOrderStock(order) {
  if (!order?.stockReserved) return;
  await restoreStock(order.items);
  order.stockReserved = false;
  await order.save();
}

async function markOrderPaid(orderId, userId) {
  const order = await orderModel.findById(orderId);
  if (!order) return null;
  if (userId && String(order.userId) !== String(userId)) return null;

  if (!order.payment) {
    order.payment = true;
    if (order.status === 'Pending Payment') {
      order.status = 'Order Placed';
    }
    await order.save();
    await applyCouponToOrder(order);
    await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
  }

  return order;
}

const placeOrder = async (req, res) => {
  try {
    const priced = await buildServerOrder(req.userId, req.body.items, req.body.address, req.body.couponCode);

    const newOrder = await persistNewOrder(priced, {
      paymentMethod: 'COD',
      payment: false,
      status: 'Order Placed',
    });
    await applyCouponToOrder(newOrder);
    await userModel.findByIdAndUpdate(req.userId, { cartData: {} });

    return ok(res, { message: 'Order Placed', orderId: newOrder._id, amount: priced.amount });
  } catch (error) {
    return checkoutError(res, error);
  }
};

const placeOrderStripe = async (req, res) => {
  try {
    const priced = await buildServerOrder(req.userId, req.body.items, req.body.address, req.body.couponCode);
    const origin = checkoutOrigin(req);

    const newOrder = await persistNewOrder(priced, {
      paymentMethod: 'Stripe',
      payment: false,
      status: 'Pending Payment',
    });

    const line_items = priced.discount > 0
      ? [{
          price_data: {
            currency: CURRENCY,
            product_data: { name: `Order ${priced.couponCode ? `(${priced.couponCode})` : ''}` },
            unit_amount: Math.round(priced.amount * 100),
          },
          quantity: 1,
        }]
      : [
          ...priced.items.map((item) => ({
            price_data: {
              currency: CURRENCY,
              product_data: { name: `${item.name} (${item.size})` },
              unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
          })),
          {
            price_data: {
              currency: CURRENCY,
              product_data: { name: 'Delivery Charges' },
              unit_amount: Math.round(DELIVERY_CHARGE * 100),
            },
            quantity: 1,
          },
        ];

    const session = await getStripe().checkout.sessions.create({
      success_url: `${origin}/verify?session_id={CHECKOUT_SESSION_ID}&orderId=${newOrder._id}`,
      cancel_url: `${origin}/verify?cancelled=true&orderId=${newOrder._id}`,
      line_items,
      mode: 'payment',
      metadata: {
        orderId: String(newOrder._id),
        userId: String(req.userId),
      },
      client_reference_id: String(newOrder._id),
    });

    newOrder.stripeSessionId = session.id;
    await newOrder.save();

    return ok(res, { session_url: session.url, amount: priced.amount });
  } catch (error) {
    return checkoutError(res, error);
  }
};

const stripeWebhook = async (req, res) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return fail(res, 503, 'Webhook is not configured');
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      secret
    );
  } catch (error) {
    return fail(res, 400, `Webhook Error: ${error.message}`);
  }

  try {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    const userId = session.metadata?.userId;

    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      if (session.payment_status === 'paid' && orderId) {
        await markOrderPaid(orderId, userId);
      }
    }

    if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
      if (orderId) {
        const unpaid = await orderModel.findOne({
          _id: orderId,
          payment: false,
          paymentMethod: 'Stripe',
        });
        if (unpaid) {
          await releaseOrderStock(unpaid);
          await orderModel.deleteOne({ _id: unpaid._id });
        }
      }
    }

    return res.json({ received: true });
  } catch (error) {
    console.log(error);
    return fail(res, 500, 'Webhook handler failed');
  }
};

const verifyStripe = async (req, res) => {
  try {
    const { sessionId, orderId } = req.body;
    if (!sessionId || !orderId) {
      return fail(res, 400, 'Missing session or order id');
    }

    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    if (
      session.metadata?.orderId !== String(orderId) ||
      session.metadata?.userId !== String(req.userId)
    ) {
      return fail(res, 403, 'Session does not match this order');
    }

    const order = await orderModel.findOne({ _id: orderId, userId: req.userId });
    if (!order) {
      return fail(res, 404, 'Order not found');
    }

    if (session.payment_status === 'paid') {
      await markOrderPaid(orderId, req.userId);
      return ok(res, { paid: true });
    }

    return ok(res, { paid: false, message: 'Payment not completed' });
  } catch (error) {
    return checkoutError(res, error);
  }
};

const placeOrderRazorpay = async (req, res) => {
  try {
    const priced = await buildServerOrder(req.userId, req.body.items, req.body.address, req.body.couponCode);

    const newOrder = await persistNewOrder(priced, {
      paymentMethod: 'Razorpay',
      payment: false,
      status: 'Pending Payment',
    });

    const rpOrder = await getRazorpay().orders.create({
      amount: Math.round(priced.amount * 100),
      currency: CURRENCY.toUpperCase(),
      receipt: newOrder._id.toString(),
    });

    newOrder.razorpayOrderId = rpOrder.id;
    await newOrder.save();

    return ok(res, { order: rpOrder, amount: priced.amount });
  } catch (error) {
    return checkoutError(res, error);
  }
};

const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return fail(res, 400, 'Missing Razorpay payment details');
    }
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return fail(res, 503, 'Razorpay is not configured');
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(payload)
      .digest('hex');

    if (!safeEqual(expected, razorpay_signature)) {
      return fail(res, 400, 'Invalid payment signature');
    }

    const payment = await getRazorpay().payments.fetch(razorpay_payment_id);
    if (payment.order_id !== razorpay_order_id) {
      return fail(res, 400, 'Payment does not match order');
    }
    if (!['captured', 'authorized'].includes(payment.status)) {
      return fail(res, 400, 'Payment not captured');
    }

    const order = await orderModel.findOne({
      razorpayOrderId: razorpay_order_id,
      userId: req.userId,
    });
    if (!order) {
      return fail(res, 404, 'Order not found');
    }

    const paidAmount = Number(payment.amount);
    if (paidAmount !== Math.round(order.amount * 100)) {
      return fail(res, 400, 'Payment amount mismatch');
    }

    await markOrderPaid(order._id, req.userId);
    return ok(res, { message: 'Payment Successful' });
  } catch (error) {
    return checkoutError(res, error);
  }
};

const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({}).sort({ date: -1 }).lean();
    return ok(res, { orders });
  } catch (error) {
    console.log(error);
    return fail(res, 500, error.message);
  }
};

const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.userId }).sort({ date: -1 }).lean();
    return ok(res, { orders });
  } catch (error) {
    console.log(error);
    return fail(res, 500, error.message);
  }
};

const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    if (!ALLOWED_STATUSES.includes(status)) {
      return fail(res, 400, 'Invalid order status');
    }

    const order = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) {
      return fail(res, 404, 'Order not found');
    }

    if (status === 'Cancelled' || status === 'Returned') {
      await releaseOrderStock(order);
    }

    return ok(res, { message: 'Status Updated' });
  } catch (error) {
    console.log(error);
    return fail(res, 500, error.message);
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await orderModel.findOne({ _id: orderId, userId: req.userId });
    if (!order) {
      return fail(res, 404, 'Order not found');
    }
    if (!CANCELLABLE.includes(order.status)) {
      return fail(res, 400, 'This order can no longer be cancelled');
    }

    order.status = 'Cancelled';
    await order.save();
    await releaseOrderStock(order);
    return ok(res, { message: 'Order cancelled' });
  } catch (error) {
    return checkoutError(res, error);
  }
};

const requestReturn = async (req, res) => {
  try {
    const { orderId, reason } = req.body;
    const order = await orderModel.findOne({ _id: orderId, userId: req.userId });
    if (!order) {
      return fail(res, 404, 'Order not found');
    }
    if (order.status !== 'Delivered') {
      return fail(res, 400, 'Only delivered orders can be returned');
    }

    order.status = 'Return Requested';
    order.returnReason = String(reason || '').trim();
    await order.save();
    return ok(res, { message: 'Return requested' });
  } catch (error) {
    return checkoutError(res, error);
  }
};

export {
  verifyRazorpay,
  verifyStripe,
  stripeWebhook,
  placeOrder,
  placeOrderStripe,
  placeOrderRazorpay,
  allOrders,
  userOrders,
  updateStatus,
  cancelOrder,
  requestReturn,
};
