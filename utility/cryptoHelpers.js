const crypto = require('crypto');
const util = require('util');

exports.performExtraHashingOnLoginHash = async (loginHash, salt) => {
  const hashIterations = parseInt(
    process.env.HASH_ITERATIONS ? 600000 : process.env.HASH_ITERATIONS
  );

  return (
    await util.promisify(crypto.pbkdf2)(
      loginHash,
      salt,
      hashIterations,
      32,
      'sha256'
    )
  ).toString('hex');
};
