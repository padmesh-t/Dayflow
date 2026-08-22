import { verifyToken } from '../utils/token.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  req.user = {
    userId: payload.userId,
    companyId: payload.companyId,
    role: payload.role,
    loginId: payload.loginId,
    email: payload.email,
    name: payload.name
  };

  next();
}
