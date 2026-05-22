import crypto from 'crypto';
import { ApiError } from './apiError.js';

function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

function parseExpiry(value = '7d') {
  const amount = parseInt(value, 10);
  if (value.endsWith('h')) return amount * 3600;
  if (value.endsWith('m')) return amount * 60;
  if (value.endsWith('d')) return amount * 86400;
  return amount || 604800; // default 7 days
}

export function signToken(payload) {
  const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + parseExpiry(process.env.JWT_EXPIRES_IN) };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(body))}`;
  const sig = crypto.createHmac('sha256', secret).update(unsigned).digest('base64url');
  return `${unsigned}.${sig}`;
}

export function verifyToken(token) {
  const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
  const parts = token?.split('.');
  if (!parts || parts.length !== 3) throw new ApiError(401, 'Invalid token');
  const [header, payload, signature] = parts;
  const expected = crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
  const given = Buffer.from(signature);
  const exp = Buffer.from(expected);
  if (given.length !== exp.length || !crypto.timingSafeEqual(given, exp)) {
    throw new ApiError(401, 'Invalid token signature');
  }
  const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  if (decoded.exp < Math.floor(Date.now() / 1000)) throw new ApiError(401, 'Token expired');
  return decoded;
}
