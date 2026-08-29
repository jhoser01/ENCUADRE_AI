/**
 * lib/security/token.ts
 * Cryptographic token utilities for client session links.
 *
 * Security properties:
 * - Raw token is 128 bits of entropy (32 hex chars)
 * - Only SHA-256 hash is persisted - raw token is never stored
 * - Comparison uses timingSafeEqual to prevent timing attacks
 */
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';

/** Generate a cryptographically secure 128-bit token as a hex string. */
export function generateClientToken(): string {
  return randomBytes(16).toString('hex');
}

/** Hash a token with SHA-256. Returns lowercase hex (64 chars). */
export async function hashToken(token: string): Promise<string> {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

/**
 * Constant-time comparison between raw token and its stored SHA-256 hash.
 * Prevents timing attacks.
 */
export async function verifyToken(token: string, hash: string): Promise<boolean> {
  const computedHash = await hashToken(token);
  const a = Buffer.from(computedHash, 'hex');
  const b = Buffer.from(hash, 'hex');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Build the full session URL sent to the client: /s/[token]
 * @example buildSessionUrl('https://encuadre.app', 'abc123')
 * => 'https://encuadre.app/s/abc123'
 */
export function buildSessionUrl(baseUrl: string, token: string): string {
  const cleanBase = baseUrl.replace(/\/$/, '');
  return `${cleanBase}/s/${token}`;
}
