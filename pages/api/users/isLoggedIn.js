import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Cookies from 'cookies';
import { promisify } from 'util';

import dbConnect from '../../../utils/dbConnect';
import User from '../../../models/userModel';
import Purchase from '../../../models/purchaseModel';

dbConnect();

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const handler = async (req, res) => {
  const { method } = req;

  if (method !== 'GET') {
    return res
      .status(400)
      .json({ status: 'fail', message: 'Only GET requests are allowed.' });
  }

  let token;
  let refresh;

  if (req.cookies && req.cookies.app_accessToken) {
    token = req.cookies.app_accessToken;
  }

  if (req.cookies && req.cookies.app_refreshToken) {
    refresh = req.cookies.app_refreshToken;
  }

  if (!token && !refresh) {
    return res.status(401).json({
      success: false,
      message: 'Please log in to get access.',
    });
  }

  // Attempt to get new auth token with refresh
  if (!token && refresh) {
    try {
      // Get user based on hashed refresh token
      const hashedRefreshToken = crypto
        .createHash('sha256')
        .update(refresh)
        .digest('hex');

      // Check if user exists with refresh token
      const refreshUser = await User.findOne({
        'refreshTokens.expiration': { $gt: Date.now() },
        'refreshTokens.token': hashedRefreshToken,
      }).populate('purchases');

      if (!refreshUser) {
        return res.status(401).json({
          success: false,
          message: 'Please log in to get access.',
        });
      }

      // Create new token
      const refreshAuthToken = signToken(refreshUser._id);

      const cookies = new Cookies(req, res);

      // Set access token cookie
      cookies.set('app_accessToken', refreshAuthToken, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV == 'production' ? 'none' : 'Lax',
        secure: process.env.NODE_ENV === 'production' ? true : false,
        maxAge: 1800000, // 30 minutes
      });

      // There is a logged in user
      return res
        .status(200)
        .json({ success: true, data: { user: refreshUser } });
    } catch (error) {
      return res.status(401).json({ success: false, data: null });
    }
  }

  if (token) {
    try {
      // Verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.app_accessToken,
        process.env.JWT_SECRET
      );

      // Check if user still exists
      const currentUser = await User.findById(decoded.id).populate('purchases');

      if (!currentUser) {
        return res.status(401).json({ success: false, data: null });
      }

      // There is a logged in user
      return res
        .status(200)
        .json({ success: true, data: { user: currentUser } });
    } catch (error) {
      return res.status(401).json({ success: false, data: null });
    }
  }
};

export default handler;
