import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import shopRouter from './routes/shopRoute.js';
import healthRouter from './routes/healthRoute.js';
import metricsMiddleware from './middleware/metricsMiddleware.js';
import {
  globalLimiter,
  attachRedisStores,
} from './middleware/rateLimiter.js';
import { stripeWebhook } from './controllers/orderController.js';
import { assertEnv, getAllowedOrigins } from './utils/env.js';
import { fail } from './utils/http.js';

assertEnv();

const app = express();
const port = process.env.PORT || 4000;
const allowedOrigins = getAllowedOrigins();

connectDB();
connectCloudinary();
await attachRedisStores();

app.set('trust proxy', 1);
app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
}));
app.use(metricsMiddleware);

app.post(
  '/api/order/stripe-webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

app.use(express.json({ limit: '10mb' }));
app.use(globalLimiter);

app.use(healthRouter);
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api', shopRouter);

app.get('/', (_req, res) => {
  res.json({
    message: 'E-Commerce API is running',
    instance: process.env.INSTANCE_ID || 'local',
    docs: '/health',
  });
});

app.use((err, _req, res, _next) => {
  console.log(err);
  return fail(res, err.status || 500, err.message || 'Internal server error');
});

const server = app.listen(port, () => {
  console.log(`Server started on PORT: ${port} [${process.env.INSTANCE_ID || 'local'}]`);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
