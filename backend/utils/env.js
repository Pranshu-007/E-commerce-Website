const WEAK_JWT_SECRETS = new Set([
  'change_me_in_production',
  'replace_with_a_long_random_value',
  'replace_with_at_least_16_random_chars',
  'secret',
  'jwtsecret',
]);

const WEAK_ADMIN_PASSWORDS = new Set([
  'admin123',
  'password',
  'replace_with_strong_password',
  'use_a_long_unique_password',
]);

function normalizeOrigin(origin) {
  return String(origin || '').trim().replace(/\/$/, '');
}

export function getAllowedOrigins() {
  return (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);
}

const VERCEL_APP_ORIGIN = /^https:\/\/[a-z0-9-]+(?:-[a-z0-9]+)*\.vercel\.app$/i;

export function isOriginAllowed(origin, allowedOrigins = getAllowedOrigins()) {
  if (!origin) return true;

  const normalized = normalizeOrigin(origin);
  if (allowedOrigins.includes(normalized)) return true;

  if (process.env.CORS_ALLOW_VERCEL === 'true' && VERCEL_APP_ORIGIN.test(normalized)) {
    return true;
  }

  return false;
}

export function assertEnv() {
  const secret = process.env.JWT_SECRET || '';
  if (secret.length < 16 || WEAK_JWT_SECRETS.has(secret)) {
    throw new Error('JWT_SECRET must be a strong secret of at least 16 characters');
  }

  if (!process.env.ADMIN_EMAIL) {
    throw new Error('ADMIN_EMAIL is required');
  }

  const adminPassword = process.env.ADMIN_PASSWORD || '';
  if (adminPassword.length < 8 || WEAK_ADMIN_PASSWORDS.has(adminPassword)) {
    throw new Error('ADMIN_PASSWORD must be a strong password of at least 8 characters');
  }
}
