import mongoose from 'mongoose';
import productModel from '../models/productModel.js';
import couponModel from '../models/couponModel.js';
import { getSizeStock } from './inventory.js';
import { CheckoutError } from '../utils/errors.js';

export { CheckoutError };

export const DELIVERY_CHARGE = Number(process.env.DELIVERY_CHARGE) || 10;
export const CURRENCY = (process.env.CURRENCY || 'usd').toLowerCase();

function sanitizeAddress(address = {}) {
  const required = ['firstName', 'lastName', 'street', 'city', 'zipcode', 'country', 'phone'];
  const clean = {
    firstName: String(address.firstName || '').trim(),
    lastName: String(address.lastName || '').trim(),
    email: String(address.email || '').trim(),
    street: String(address.street || '').trim(),
    city: String(address.city || '').trim(),
    state: String(address.state || '').trim(),
    zipcode: String(address.zipcode || '').trim(),
    country: String(address.country || '').trim(),
    phone: String(address.phone || '').trim(),
  };

  for (const field of required) {
    if (!clean[field]) {
      throw new CheckoutError('Delivery address is incomplete');
    }
  }

  return clean;
}

function parseQuantity(value) {
  const quantity = Number(value);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    throw new CheckoutError('Invalid item quantity');
  }
  return quantity;
}

export async function applyCoupon(code, itemsTotal) {
  if (!code || !String(code).trim()) {
    return { discount: 0, couponCode: '' };
  }

  const coupon = await couponModel.findOne({
    code: String(code).trim().toUpperCase(),
    active: true,
  });

  if (!coupon) {
    throw new CheckoutError('Invalid coupon code');
  }
  if (coupon.expiresAt && coupon.expiresAt < Date.now()) {
    throw new CheckoutError('This coupon has expired');
  }
  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
    throw new CheckoutError('This coupon has reached its usage limit');
  }
  if (itemsTotal < coupon.minAmount) {
    throw new CheckoutError(`Coupon requires a minimum subtotal of ${coupon.minAmount}`);
  }

  let discount = coupon.type === 'percent'
    ? Math.round((itemsTotal * coupon.value) / 100)
    : coupon.value;

  discount = Math.min(discount, itemsTotal);
  if (discount < 0) discount = 0;

  return { discount, couponCode: coupon.code };
}

export async function incrementCouponUse(code) {
  if (!code) return;
  await couponModel.updateOne(
    { code: String(code).toUpperCase() },
    { $inc: { usedCount: 1 } }
  );
}

export async function buildServerOrder(userId, rawItems, address, couponCode) {
  if (!userId) {
    throw new CheckoutError('Not Authorized Login Again', 401);
  }
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new CheckoutError('Cart is empty');
  }

  const lines = [];

  for (const raw of rawItems) {
    const productId = raw.productId || raw._id || raw.itemId;
    const size = String(raw.size || '').trim();
    const quantity = parseQuantity(raw.quantity);

    if (!productId || !mongoose.Types.ObjectId.isValid(productId) || !size) {
      throw new CheckoutError('Invalid cart item');
    }

    const product = await productModel.findById(productId).lean();
    if (!product) {
      throw new CheckoutError('A product in your cart is no longer available', 404);
    }

    const sizes = (product.sizes || []).map(String);
    if (!sizes.includes(size)) {
      throw new CheckoutError(`Size ${size} is not available for ${product.name}`);
    }

    const available = getSizeStock(product, size);
    if (Number.isFinite(available) && available < quantity) {
      throw new CheckoutError(`Only ${available} left for ${product.name} (${size})`);
    }

    lines.push({
      _id: product._id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      image: product.image,
      category: product.category,
      subCategory: product.subCategory,
      size,
      quantity,
    });
  }

  const itemsTotal = lines.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const { discount, couponCode: appliedCode } = await applyCoupon(couponCode, itemsTotal);
  const amount = Math.max(0, itemsTotal + DELIVERY_CHARGE - discount);

  return {
    userId: String(userId),
    items: lines,
    address: sanitizeAddress(address),
    amount,
    discount,
    couponCode: appliedCode,
  };
}
