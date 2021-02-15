import Cookies from 'cookies';

import dbConnect from '../../../utils/dbConnect';
import withProtect from '../../../middleware/withProtect';
import withRoles from '../../../middleware/withRoles';

dbConnect();

const handler = async (req, res) => {
  const { method } = req;

  if (method !== 'POST') {
    return res
      .status(400)
      .json({ success: false, message: 'Only POST requests are allowed.' });
  }

  // Removed refreshTokens from database
  req.user.refreshTokens = [];

  const cookies = new Cookies(req, res);

  // Set cookies to expired
  cookies.set('app_accessToken', '', {
    httpOnly: true,
    sameSite: process.env.NODE_ENV == 'production' ? 'none' : 'Lax',
    secure: process.env.NODE_ENV === 'production' ? true : false,
  });

  cookies.set('app_refreshToken', '', {
    httpOnly: true,
    sameSite: process.env.NODE_ENV == 'production' ? 'none' : 'Lax',
    secure: process.env.NODE_ENV === 'production' ? true : false,
  });

  await req.user.save();

  return res.status(200).json({
    success: true,
    data: {},
  });
};

export default withProtect(handler);
// export default withProtect(withRoles(handler, 'admin'));
