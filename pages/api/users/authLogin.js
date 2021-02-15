import dbConnect from '../../../utils/dbConnect';
import User from '../../../models/userModel';
import Email from '../../../utils/email';

dbConnect();

const handler = async (req, res) => {
  const { method } = req;

  if (method !== 'POST') {
    return res
      .status(400)
      .json({ success: false, message: 'Only POST requests are allowed.' });
  }

  // Get user based on POSTed email
  let user = await User.findOne({ email: req.body.email });

  if (!user) {
    user = await User.create({
      email: req.body.email,
    });
  }

  // Generate the random auth token
  const authToken = user.createAuthToken();

  await user.save({ validateBeforeSave: false });

  try {
    await new Email(user, authToken).sendMagicLink();

    return res.status(200).json({
      success: true,
      message: 'Check your email to complete login.',
    });
  } catch (error) {
    // Remove any tokens on the user in the database...
    // ...and save it in MongoDB
    user.authLoginToken = undefined;
    user.authLoginExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return res.status(500).json({
      success: false,
      message: 'Error sending email. Please try again.',
    });
  }
};

export default handler;
