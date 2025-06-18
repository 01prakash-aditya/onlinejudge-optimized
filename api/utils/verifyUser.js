import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

export const verifytoken = (req, res, next) => {
  // Enhanced debug info
  const debugInfo = {
    host: req.get('host'),
    origin: req.get('origin'),
    forwardedProto: req.get('x-forwarded-proto'),
    userAgent: req.get('user-agent'),
    cookies: req.cookies,
    cookieHeader: req.headers.cookie,
    authHeader: req.headers.authorization,
    customHeaders: {
      'x-access-token': req.headers['x-access-token'],
      'x-auth-token': req.headers['x-auth-token']
    },
    method: req.method,
    path: req.path
  };
  
  console.log('Token Verification Debug:', debugInfo);

  let token = null;
  let tokenSource = 'none';

  // Priority 1: Check cookies (most secure)
  if (req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
    tokenSource = 'cookie';
  }

  // Priority 2: Authorization Bearer header (AWS common)
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7);
        tokenSource = 'bearer';
      } else if (authHeader.startsWith('Token ')) {
        token = authHeader.slice(6);
        tokenSource = 'token';
      }
    }
  }
  
  // Priority 3: Custom headers (fallback)
  if (!token) {
    token = req.headers['x-access-token'] || req.headers['x-auth-token'];
    if (token) {
      tokenSource = 'custom-header';
    }
  }

  // Priority 4: Query parameter (last resort, less secure)
  if (!token && req.query.token) {
    token = req.query.token;
    tokenSource = 'query';
  }

  console.log(`Token found via: ${tokenSource}`);

  if (!token) {
    console.log('❌ No token found in any location');
    return next(errorHandler(401, 'Access denied. No authentication token provided.'));
  }

  try {
    // Verify token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    
    console.log('✅ Token verified successfully:', {
      userId: verified.id,
      role: verified.role,
      tokenSource,
      expiresAt: new Date(verified.exp * 1000).toISOString()
    });
    
    next();
  } catch (error) {
    console.log('❌ Token verification failed:', {
      error: error.message,
      tokenSource,
      tokenLength: token ? token.length : 0
    });
    
    if (error.name === 'TokenExpiredError') {
      return next(errorHandler(401, 'Token has expired. Please sign in again.'));
    } else if (error.name === 'JsonWebTokenError') {
      return next(errorHandler(401, 'Invalid token format.'));
    } else {
      return next(errorHandler(401, 'Token verification failed.'));
    }
  }
};