exports.handleException = (exception, res) => {
  res.status(500).json({
    status: 'exception',
    message:
      process.env.NODE_ENV.toLowerCase() === 'production'
        ? exception.message
        : exception.stack,
  });
};
