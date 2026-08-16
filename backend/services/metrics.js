const metrics = {
  startTime: Date.now(),
  requests: { total: 0, errors: 0, byStatus: {} },
  responseTimeMs: { sum: 0, count: 0, max: 0 },
  cache: { hits: 0, misses: 0 },
  endpoints: {},
};

function recordRequest({ method, path, statusCode, durationMs }) {
  metrics.requests.total += 1;

  const statusKey = String(statusCode);
  metrics.requests.byStatus[statusKey] = (metrics.requests.byStatus[statusKey] || 0) + 1;

  if (statusCode >= 500) {
    metrics.requests.errors += 1;
  }

  metrics.responseTimeMs.sum += durationMs;
  metrics.responseTimeMs.count += 1;
  if (durationMs > metrics.responseTimeMs.max) {
    metrics.responseTimeMs.max = durationMs;
  }

  const routeKey = `${method} ${path}`;
  if (!metrics.endpoints[routeKey]) {
    metrics.endpoints[routeKey] = { count: 0, avgMs: 0, errors: 0 };
  }
  const ep = metrics.endpoints[routeKey];
  ep.count += 1;
  ep.avgMs = Math.round(((ep.avgMs * (ep.count - 1)) + durationMs) / ep.count);
  if (statusCode >= 500) ep.errors += 1;
}

function recordCacheHit() {
  metrics.cache.hits += 1;
}

function recordCacheMiss() {
  metrics.cache.misses += 1;
}

function getSnapshot() {
  const uptimeSec = Math.floor((Date.now() - metrics.startTime) / 1000);
  const mem = process.memoryUsage();

  return {
    uptime: uptimeSec,
    instance: process.env.INSTANCE_ID || 'local',
    timestamp: new Date().toISOString(),
    requests: {
      total: metrics.requests.total,
      errors: metrics.requests.errors,
      errorRate: metrics.requests.total > 0
        ? ((metrics.requests.errors / metrics.requests.total) * 100).toFixed(2) + '%'
        : '0%',
      byStatus: metrics.requests.byStatus,
    },
    responseTime: {
      avgMs: metrics.responseTimeMs.count > 0
        ? Math.round(metrics.responseTimeMs.sum / metrics.responseTimeMs.count)
        : 0,
      maxMs: metrics.responseTimeMs.max,
    },
    cache: {
      hits: metrics.cache.hits,
      misses: metrics.cache.misses,
      hitRate: (metrics.cache.hits + metrics.cache.misses) > 0
        ? ((metrics.cache.hits / (metrics.cache.hits + metrics.cache.misses)) * 100).toFixed(2) + '%'
        : '0%',
    },
    memory: {
      rssMB: Math.round(mem.rss / 1024 / 1024),
      heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
    },
    topEndpoints: Object.entries(metrics.endpoints)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([route, data]) => ({ route, ...data })),
  };
}

function toPrometheus() {
  const snap = getSnapshot();
  const lines = [
    '# HELP http_requests_total Total HTTP requests',
    '# TYPE http_requests_total counter',
    `http_requests_total{instance="${snap.instance}"} ${snap.requests.total}`,
    '# HELP http_request_errors_total Total HTTP 5xx errors',
    '# TYPE http_request_errors_total counter',
    `http_request_errors_total{instance="${snap.instance}"} ${snap.requests.errors}`,
    '# HELP http_response_time_avg_ms Average response time in ms',
    '# TYPE http_response_time_avg_ms gauge',
    `http_response_time_avg_ms{instance="${snap.instance}"} ${snap.responseTime.avgMs}`,
    '# HELP cache_hits_total Redis cache hits',
    '# TYPE cache_hits_total counter',
    `cache_hits_total{instance="${snap.instance}"} ${snap.cache.hits}`,
    '# HELP cache_misses_total Redis cache misses',
    '# TYPE cache_misses_total counter',
    `cache_misses_total{instance="${snap.instance}"} ${snap.cache.misses}`,
    '# HELP process_uptime_seconds Process uptime',
    '# TYPE process_uptime_seconds gauge',
    `process_uptime_seconds{instance="${snap.instance}"} ${snap.uptime}`,
    '# HELP process_heap_used_bytes Heap memory used',
    '# TYPE process_heap_used_bytes gauge',
    `process_heap_used_bytes{instance="${snap.instance}"} ${snap.memory.heapUsedMB * 1024 * 1024}`,
  ];
  return lines.join('\n') + '\n';
}

export { recordRequest, recordCacheHit, recordCacheMiss, getSnapshot, toPrometheus };
