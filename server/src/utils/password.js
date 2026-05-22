import crypto from 'crypto';

const KEY_LENGTH = 64;

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password, storedHash, storedSalt) {
  const hash = crypto.scryptSync(password, storedSalt, KEY_LENGTH);
  const original = Buffer.from(storedHash, 'hex');
  return original.length === hash.length && crypto.timingSafeEqual(original, hash);
}
