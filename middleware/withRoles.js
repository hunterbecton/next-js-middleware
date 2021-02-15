const withRoles = (handler, ...roles) => {
  return async (req, res) => {
    // Roles in an array
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
    }

    return handler(req, res);
  };
};

export default withRoles;
