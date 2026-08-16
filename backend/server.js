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
import healthRouter from './routes/healthRoute.js';
import metricsMiddleware from './middleware/metricsMiddleware.js';
import {
  globalLimiter,
  authLimiter,
  checkoutLimiter,
  attachRedisStores,
} from './middleware/rateLimiter.js';

const app = express();
const port = process.env.PORT || 4000;

connectDB();
connectCloudinary();
await attachRedisStores();

app.set('trust proxy', 1);
app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.use(metricsMiddleware);
app.use(globalLimiter);

app.use(healthRouter);
app.use('/api/user', authLimiter, userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', checkoutLimiter, orderRouter);

app.get('/', (_req, res) => {
  res.json({
    message: 'E-Commerce API is running',
    instance: process.env.INSTANCE_ID || 'local',
    docs: '/health',
  });
});

const server = app.listen(port, () => {
  console.log(`Server started on PORT: ${port} [${process.env.INSTANCE_ID || 'local'}]`);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
