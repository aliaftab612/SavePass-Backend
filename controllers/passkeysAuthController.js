const ApiError = require('../utility/ApiError');
const asyncHander = require('../utility/asyncHandler');
const {
  PasswordlessClient,
  RegisterOptions,
  Converters,
} = require('@passwordlessdev/passwordless-nodejs');

const _passwordlessClient = new PasswordlessClient(
  process.env.PASSWORDLESS_API_SECRET
);

exports.passkeysRegistrationBegin = asyncHander(async (req, res) => {
  const user = req.user;

  const registerOptions = new RegisterOptions();
  registerOptions.userId = user._id;
  registerOptions.username = user.email;
  registerOptions.displayName = (user.firstName + ' ' + user.lastName).trim();
  registerOptions.discoverable = true;
  registerOptions.userVerification = 'required';
  registerOptions.aliases = [user.email];

  const token = await _passwordlessClient.createRegisterToken(registerOptions);

  res.status(200).json({
    status: 'success',
    token: token.token,
    userId: user._id,
  });
});

exports.passkeysRegistrationComplete = asyncHander(async (req, res) => {
  const user = req.user;

  res.status(200).json({
    status: 'success',
    data: null,
  });
});

exports.getUserPasskeyCredentials = asyncHander(async (req, res) => {
  const user = req.user;

  const credentials = await _passwordlessClient.listCredentials(user._id);

  res.status(200).json({
    status: 'success',
    credentials,
  });
});

exports.deleteUserPasskeyCredential = asyncHander(async (req, res) => {
  if (!req.body.credentialId) {
    throw new ApiError(400, 'Please provide Credential Id!');
  }

  await _passwordlessClient.deleteCredential(
    Converters.base64UrlToUint8Array(req.body.credentialId)
  );

  res.status(204).json({
    status: 'success',
  });
});

exports.savePasskeyEncryptedEncryptionKey = asyncHander(async (req, res) => {
  const user = req.user;

  if (
    !req.body.credentialId ||
    !req.body.publicRSAKey ||
    !req.body.encryptedPrivateRSAKey ||
    !req.body.encryptedVaultEncryptionKey
  ) {
    throw new ApiError(400, 'Please provide all mandatory fields!');
  }

  const credentials = await _passwordlessClient.listCredentials(user._id);

  if (
    !credentials.some(
      (credential) => credential.descriptor.id === req.body.credentialId
    )
  ) {
    throw new ApiError(
      404,
      `credentialId : ${req.body.credentialId} not found on passwordless dev server!`
    );
  }

  user.passkeyEncryptedEncryptionKeys.push({
    credentialId: req.body.credentialId,
    publicRSAKey: req.body.publicRSAKey,
    encryptedPrivateRSAKey: req.body.encryptedPrivateRSAKey,
    encryptedVaultEncryptionKey: req.body.encryptedVaultEncryptionKey,
  });

  await user.save();

  res.status(201).json({
    status: 'success',
    data: {
      passkeyEncryptedEncryptionKeyId:
        user.passkeyEncryptedEncryptionKeys[
          user.passkeyEncryptedEncryptionKeys.length - 1
        ]._id,
    },
  });
});
