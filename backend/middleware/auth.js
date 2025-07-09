const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

function authMiddleware(req, res, next) {
  console.log('AUTH MIDDLEWARE', req.headers['authorization']);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    console.warn('[AUTH] No token provided. Header:', authHeader);
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    console.info('[AUTH] Token valid. Decoded user:', decoded);
    next();
  } catch (err) {
    console.warn('[AUTH] Invalid token:', token);
    res.status(401).json({ message: 'Token is not valid' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      console.warn(`[AUTH] Access denied: required role=${role}, user role=${req.user && req.user.role}`);
      return res.status(403).json({ message: 'Access denied: insufficient role' });
    }
    next();
  };
}

function requireAnyRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      console.warn(`[AUTH] Access denied: required roles=${roles}, user role=${req.user && req.user.role}`);
      return res.status(403).json({ message: 'Access denied: insufficient role' });
    }
    next();
  };
}

module.exports = { authMiddleware, requireRole, requireAnyRole }; 