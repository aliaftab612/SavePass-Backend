exports.handleException = (exception, res) => {
  if (exception.code && exception.code === 11000) {
    res.status(409).json({
      status: 'fail',
      message: 'Email Already Exists',
    });
    return;
  }

  res.status(500).json({
    status: 'exception',
    message:
      process.env.NODE_ENV.toLowerCase() === 'production'
        ? exception.message
        : exception.stack,
  });
};
