import { getRedis } from '../config/redis.js';
import { recordCacheHit, recordCacheMiss } from './metrics.js';

const DEFAULT_TTL = parseInt(process.env.CACHE_TTL_SECONDS, 10) || 60;

export async function get(key) {
  const redis = await getRedis();
  if (!redis) return null;

  try {
    const value = await redis.get(key);
    if (value) {
      recordCacheHit();
      return JSON.parse(value);
    }
    recordCacheMiss();
    return null;
  } catch {
    recordCacheMiss();
    return null;
  }
}

export async function set(key, value, ttl = DEFAULT_TTL) {
  const redis = await getRedis();
  if (!redis) return false;

  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
    return true;
  } catch {
    return false;
  }
}

export async function del(key) {
  const redis = await getRedis();
  if (!redis) return false;

  try {
    await redis.del(key);
    return true;
  } catch {
    return false;
  }
}

export async function delByPattern(pattern) {
  const redis = await getRedis();
  if (!redis) return false;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);
    return true;
  } catch {
    return false;
  }
}

export async function invalidateProductCache() {
  await delByPattern('products:list:*');
  await delByPattern('products:single:*');
}
