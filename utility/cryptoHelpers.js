const crypto = require('crypto');

exports.performExtraHashingOnLoginHash = async (loginHash, salt) => {
  const hashIterations = parseInt(
    process.env.HASH_ITERATIONS ? 600000 : process.env.HASH_ITERATIONS
  );

  return crypto
    .pbkdf2Sync(loginHash, salt, hashIterations, 32, 'sha256')
    .toString('hex');
};
