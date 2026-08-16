import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { getRedis } from '../config/redis.js';

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000;
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX, 10) || 100;

export const globalLimiter = rateLimit({
  windowMs,
  max: maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' },
});

export const checkoutLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many checkout requests. Please slow down.' },
});

export async function attachRedisStores() {
  const redis = await getRedis();
  if (!redis) return;

  globalLimiter.store = new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: 'rl:global:',
  });

  authLimiter.store = new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: 'rl:auth:',
  });

  checkoutLimiter.store = new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: 'rl:checkout:',
  });
}
