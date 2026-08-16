import { recordRequest } from '../services/metrics.js';

const SKIP_PATHS = ['/metrics', '/health', '/live', '/ready', '/status'];

function metricsMiddleware(req, res, next) {
  if (SKIP_PATHS.includes(req.path)) {
    return next();
  }

  const start = Date.now();

  res.on('finish', () => {
    recordRequest({
      method: req.method,
      path: req.route?.path || req.path,
      statusCode: res.statusCode,
      durationMs: Date.now() - start,
    });
  });

  next();
}

export default metricsMiddleware;
