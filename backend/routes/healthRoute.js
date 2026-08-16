import express from 'express';
import mongoose from 'mongoose';
import os from 'os';
import { getRedis } from '../config/redis.js';
import { getSnapshot, toPrometheus } from '../services/metrics.js';

const healthRouter = express.Router();
const startTime = Date.now();

async function checkDatabase() {
  try {
    return mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  } catch {
    return 'disconnected';
  }
}

async function checkRedis() {
  try {
    const redis = await getRedis();
    if (!redis) return 'unavailable';
    await redis.ping();
    return 'connected';
  } catch {
    return 'disconnected';
  }
}

healthRouter.get('/live', (_req, res) => {
  res.status(200).json({
    status: 'alive',
    instance: process.env.INSTANCE_ID || 'local',
    timestamp: new Date().toISOString(),
  });
});

healthRouter.get('/health', async (_req, res) => {
  const [database, redis] = await Promise.all([checkDatabase(), checkRedis()]);

  res.status(200).json({
    status: 'ok',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    instance: process.env.INSTANCE_ID || 'local',
    timestamp: new Date().toISOString(),
    dependencies: { database, redis },
  });
});

healthRouter.get('/ready', async (_req, res) => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
  };

  const isReady = checks.database === 'connected';
  res.status(isReady ? 200 : 503).json({
    status: isReady ? 'ready' : 'not_ready',
    checks,
    instance: process.env.INSTANCE_ID || 'local',
    timestamp: new Date().toISOString(),
  });
});

healthRouter.get('/status', async (_req, res) => {
  const [database, redis] = await Promise.all([checkDatabase(), checkRedis()]);
  const metrics = getSnapshot();

  res.status(200).json({
    service: 'ecommerce-api',
    environment: process.env.NODE_ENV || 'development',
    instance: process.env.INSTANCE_ID || 'local',
    version: process.env.npm_package_version || '1.0.0',
    node: process.version,
    platform: `${os.platform()} ${os.arch()}`,
    loadAverage: os.loadavg(),
    dependencies: { database, redis },
    metrics,
  });
});

healthRouter.get('/metrics', (_req, res) => {
  const format = _req.query.format || 'prometheus';

  if (format === 'json') {
    return res.json(getSnapshot());
  }

  res.set('Content-Type', 'text/plain; version=0.0.4');
  res.send(toPrometheus());
});

export default healthRouter;
