import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

export const verifytoken = (req, res, next) => {
  let token = req.cookies.access_token;
  
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }
  
  if (!token) {
    console.log('No token found in cookies or headers');
    console.log('Cookies:', req.cookies);
    console.log('Authorization header:', req.headers.authorization);
    return next(errorHandler(401, 'Access denied. No token provided.'));
  }
  
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    console.log('Token verified successfully for user:', verified.id);
    next();
  } catch (error) {
    console.log('Token verification failed:', error.message);
    return next(errorHandler(401, 'Invalid token.'));
  }
};