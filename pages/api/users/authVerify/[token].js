import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Cookies from 'cookies';

import dbConnect from '../../../../utils/dbConnect';
import User from '../../../../models/userModel';

dbConnect();

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const handler = async (req, res) => {
  const { method } = req;

  if (method !== 'POST') {
    return res
      .status(400)
      .json({ success: false, message: 'Only POST requests are allowed.' });
  }

  const {
    query: { token },
  } = req;

  // Get user based on token
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    authLoginToken: hashedToken,
    authLoginExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(500).json({
      success: false,
      message: 'Token is invalid or expired.',
    });
  }

  // If the user exists and token isn't expired, remove token and send JWT token
  user.authLoginToken = undefined;
  user.authLoginExpires = undefined;

  await user.save();

  // Log the user in and send JWT
  const cookies = new Cookies(req, res);

  const signedToken = signToken(user._id);

  // Generate the random refresh token
  const refreshToken = crypto.randomBytes(32).toString('hex');

  const hashedRefreshToken = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  const refreshExpiration = new Date().setDate(new Date().getDate() + 7); // 7 days

  // Set refresh token cookie
  cookies.set('app_refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV == 'production' ? 'none' : 'Lax',
    secure: process.env.NODE_ENV === 'production' ? true : false,
    maxAge: 604800000, // 7 days
  });

  // Set access token cookie
  cookies.set('app_accessToken', signedToken, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV == 'production' ? 'none' : 'Lax',
    secure: process.env.NODE_ENV === 'production' ? true : false,
    maxAge: 1800000, // 30 minutes
  });

  await User.findByIdAndUpdate(user._id, {
    $push: {
      refreshTokens: {
        token: hashedRefreshToken,
        expiration: refreshExpiration,
      },
    },
  });

  return res.status(200).json({
    success: true,
    signedToken,
    data: {
      user,
    },
  });
};

export default handler;
