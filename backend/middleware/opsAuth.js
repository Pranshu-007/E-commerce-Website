import { fail } from '../utils/http.js';
import { safeEqual } from '../utils/crypto.js';

export default function opsAuth(req, res, next) {
  const expected = process.env.METRICS_TOKEN;
  if (!expected) {
    return fail(res, 404, 'Not found');
  }

  const provided = req.get('x-ops-token') || '';
  if (!safeEqual(provided, expected)) {
    return fail(res, 401, 'Unauthorized');
  }

  next();
}
