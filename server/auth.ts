import crypto from 'node:crypto';
import { Request, Response, NextFunction } from 'express';
import { db } from './db';

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, hash: string): boolean {
  const testHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(testHash, 'hex'), Buffer.from(hash, 'hex'));
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function createSession(userId: string): string {
  const token = generateToken();
  const createdAt = Date.now();
  const expiresAt = createdAt + 30 * 24 * 60 * 60 * 1000; // 30 days session
  const stmt = db.prepare('INSERT INTO session_tokens (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)');
  stmt.run(token, userId, createdAt, expiresAt);
  return token;
}

export function deleteSession(token: string): void {
  const stmt = db.prepare('DELETE FROM session_tokens WHERE token = ?');
  stmt.run(token);
}

export function getUserFromToken(token: string): { id: string; username: string; email: string } | null {
  if (!token) return null;
  const now = Date.now();
  const sessionRow = db.prepare(`
    SELECT s.user_id, u.username, u.email 
    FROM session_tokens s 
    JOIN users u ON s.user_id = u.id 
    WHERE s.token = ? AND s.expires_at > ?
  `).get(token, now) as { user_id: string; username: string; email: string } | undefined;

  if (!sessionRow) return null;
  return {
    id: sessionRow.user_id,
    username: sessionRow.username,
    email: sessionRow.email,
  };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: missing or invalid authentication token' });
  }

  const token = authHeader.substring(7).trim();
  const user = getUserFromToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: session expired or invalid' });
  }

  req.userId = user.id;
  req.user = user;
  next();
}
