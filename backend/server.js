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
import { assertEnv, getAllowedOrigins, isOriginAllowed } from './utils/env.js';
import { fail } from './utils/http.js';

async function buildApp() {
  assertEnv();

  await connectDB();
  connectCloudinary();
  await attachRedisStores();

  const app = express();
  const allowedOrigins = getAllowedOrigins();

  app.set('trust proxy', 1);
  app.use(cors({
    origin(origin, callback) {
      if (isOriginAllowed(origin, allowedOrigins)) {
        return callback(null, true);
      }
      console.warn(`[CORS] Blocked origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token', 'X-Requested-With'],
    optionsSuccessStatus: 204,
  }));
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));
  app.use(compression());
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  app.use(metricsMiddleware);

  app.get('/favicon.ico', (_req, res) => res.status(204).end());

  app.post(
    '/api/order/stripe-webhook',
    express.raw({ type: 'application/json' }),
    stripeWebhook
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(globalLimiter);

  const ensureDb = async (_req, res, next) => {
    try {
      await connectDB();
      return next();
    } catch (error) {
      console.error('Database unavailable:', error.message);
      return fail(res, 503, 'Database unavailable. Check MONGODB_URI on the server.');
    }
  };

  app.use(healthRouter);
  app.use('/api/user', ensureDb, userRouter);
  app.use('/api/product', ensureDb, productRouter);
  app.use('/api/cart', ensureDb, cartRouter);
  app.use('/api/order', ensureDb, orderRouter);
  app.use('/api', ensureDb, shopRouter);

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

  return app;
}

const app = await buildApp();

if (!process.env.VERCEL) {
  const port = process.env.PORT || 4000;
  const server = app.listen(port, () => {
    console.log(`Server started on PORT: ${port} [${process.env.INSTANCE_ID || 'local'}]`);
  });

  process.on('SIGTERM', () => {
    server.close(() => process.exit(0));
  });
}

export default app;
