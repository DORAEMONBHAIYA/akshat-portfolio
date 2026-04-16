import crypto from 'crypto';
import { db } from './db';
import { compareSync } from 'bcryptjs';

export interface AdminSession {
  username: string;
  authenticated: boolean;
  loginTime: string;
}

// Secret key for signing tokens — persists across restarts
const SECRET = process.env.AUTH_SECRET || 'portfolio-admin-hmac-secret-key-2024';

function base64urlEncode(data: Buffer | string): string {
  const buf = typeof data === 'string' ? Buffer.from(data) : data;
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(str: string): Buffer {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - str.length % 4) % 4);
  return Buffer.from(padded, 'base64');
}

export async function authenticateAdmin(username: string, password: string): Promise<AdminSession | null> {
  const user = await db.adminUser.findUnique({
    where: { username },
  });

  if (!user) return null;

  const isValid = compareSync(password, user.password);
  if (!isValid) return null;

  return {
    username: user.username,
    authenticated: true,
    loginTime: new Date().toISOString(),
  };
}

/**
 * Generate a signed token containing the session payload.
 * No server-side storage needed — the token is self-contained.
 */
export function generateSignedToken(session: AdminSession): string {
  const payload = {
    ...session,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
  };

  const payloadStr = base64urlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(payloadStr)
    .digest();

  return `${payloadStr}.${base64urlEncode(signature)}`;
}

/**
 * Validate a signed token by verifying its HMAC signature and expiry.
 */
export function validateToken(token: string): AdminSession | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payloadStr, signatureStr] = parts;
    const payload = JSON.parse(base64urlDecode(payloadStr).toString());

    // Check expiry
    if (Date.now() > payload.exp) return null;

    // Verify HMAC signature
    const expectedSig = crypto
      .createHmac('sha256', SECRET)
      .update(payloadStr)
      .digest();

    const actualSig = base64urlDecode(signatureStr);

    if (!crypto.timingSafeEqual(expectedSig, actualSig)) return null;

    return {
      username: payload.username,
      authenticated: true,
      loginTime: payload.loginTime,
    };
  } catch {
    return null;
  }
}

// Legacy compat — kept for any code that still imports these
export const generateToken = generateSignedToken;
export const storeToken = (_token: string, _session: AdminSession): void => { /* no-op */ };
export const removeToken = (_token: string): void => { /* no-op */ };
