import Redis from 'ioredis';

let redis = null;
let redisUnavailable = false;

function createRedisClient() {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';

  const client = new Redis(url, {
    maxRetriesPerRequest: 3,
    connectTimeout: 3000,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
    enableOfflineQueue: false,
  });

  client.on('error', () => {
    // Errors are handled in getRedis() — avoid spamming the console on every request
  });

  client.on('connect', () => {
    console.log('[Redis] Connected');
  });

  return client;
}

export async function getRedis() {
  if (redisUnavailable) return null;

  if (!redis) {
    redis = createRedisClient();
    try {
      await redis.connect();
    } catch (err) {
      console.warn(`[Redis] Unavailable — caching disabled (${err.code || err.message || 'not running'}). Start Redis or ignore if running locally without Docker.`);
      try { await redis.quit(); } catch { /* ignore */ }
      redis = null;
      redisUnavailable = true;
    }
  }

  return redis;
}

export async function closeRedis() {
  if (redis) {
    await redis.quit();
    redis = null;
  }
  redisUnavailable = false;
}
