class MulterNotImageTypeError extends Error {
  constructor(message) {
    super(message);
    this.code = 'NOT_IMAGE_TYPE';
    this.name = 'MulterError';
  }
}

module.exports = MulterNotImageTypeError;
