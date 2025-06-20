import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';

export const signup = async (req, res, next) => {
  const { username, email, password, fullName, dob, role, secretCode } = req.body;
  
  try {
    if (role === 'admin') {
      const ADMIN_SECRET_CODE = process.env.ADMIN_SECRET_CODE || 'admin123'; 
      
      if (!secretCode) {
        return next(errorHandler(400, 'Secret code is required for admin registration'));
      }
      
      if (secretCode !== ADMIN_SECRET_CODE) {
        return next(errorHandler(401, 'Invalid admin secret code'));
      }
    }

    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return next(errorHandler(400, 'Email already exists'));
      }
      if (existingUser.username === username) {
        return next(errorHandler(400, 'Username already exists'));
      }
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);
    
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      fullName,
      dob,
      role: role || 'user' 
    });

    await newUser.save();
    
    if (role === 'admin') {
      console.log(`New admin registered: ${email} at ${new Date().toISOString()}`);
    }
    
    res.status(201).json({ 
      success: true,
      message: `${role === 'admin' ? 'Administrator' : 'User'} created successfully` 
    });
    
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  
  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, 'User not found'));
    
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, 'Wrong credentials'));

    const token = jwt.sign({
      id: validUser._id,
      role: validUser.role
    }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    const { password: hashedPassword, ...rest } = validUser._doc;
    const expiryDate = new Date(Date.now() + 3600000); // 1 hour
    
    // Simplified cookie options for local development with self-signed HTTPS
    const cookieOptions = {
      httpOnly: true,         // Prevents JS access to token (secure)
      expires: expiryDate,
      secure: false,          // ❗ Required for self-signed HTTPS certificates
      sameSite: 'Lax',       // ✅ Allows cross-origin requests from localhost:5173
      path: '/',
    };

    // Debug logging for development
    console.log('Authentication Debug:', {
      host: req.get('host'),
      origin: req.get('origin'),
      protocol: req.get('x-forwarded-proto') || req.protocol,
      cookieOptions,
      userAgent: req.get('user-agent')
    });
    
    // Set cookie and return response
    res
      .cookie('access_token', token, cookieOptions)
      .status(200)
      .json({
        success: true,
        token,              // Include token in response body as backup
        user: rest,
        message: 'Signed in successfully',
        authMethod: 'cookie'
      });
      
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = jwt.sign({ 
        id: user._id, 
        role: user.role 
      }, process.env.JWT_SECRET, {
        expiresIn: '1h'
      });
      
      const { password: hashedPassword, ...rest } = user._doc;
      const expiryDate = new Date(Date.now() + 3600000); // 1 hour
      
      res
        .cookie('access_token', token, {
          httpOnly: true,
          expires: expiryDate,
          secure: false,      // ❗ Required for self-signed HTTPS
          sameSite: 'Lax',   // ✅ Allows cross-origin requests
          path: '/'
        })
        .status(200)
        .json({
          success: true,
          token,
          ...rest
        });
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      
      const username = req.body.username || 
        req.body.email.split('@')[0].toLowerCase() +
        Math.random().toString(36).slice(-8);
      
      const newUser = new User({
        username: username,
        email: req.body.email,
        password: hashedPassword,
        fullName: req.body.fullName || 'Google User',
        dob: req.body.dob || new Date(),
        profilePicture: req.body.profilePicture || req.body.photo,
        role: req.body.role || 'user',
      });
      
      await newUser.save();
      
      const token = jwt.sign({ 
        id: newUser._id, 
        role: newUser.role 
      }, process.env.JWT_SECRET, {
        expiresIn: '1h'
      });
      
      const { password: hashedPassword2, ...rest } = newUser._doc;
      const expiryDate = new Date(Date.now() + 3600000); // 1 hour
      
      res
        .cookie('access_token', token, {
          httpOnly: true,
          expires: expiryDate,
          secure: false,      // ❗ Required for self-signed HTTPS
          sameSite: 'Lax',   // ✅ Allows cross-origin requests
          path: '/'
        })
        .status(200)
        .json({
          success: true,
          token,
          ...rest
        });
    }
  } catch (error) {
    next(error);
  }
};

export const signout = (req, res) => {
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: false,    // ❗ Must match the original cookie settings
    sameSite: 'Lax',
    path: '/'
  }).status(200).json({
    success: true,
    message: 'User has been logged out.'
  });
};