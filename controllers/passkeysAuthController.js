const ApiError = require('../utility/ApiError');
const asyncHander = require('../utility/asyncHandler');
const {
  PasswordlessClient,
  RegisterOptions,
  Converters,
} = require('@passwordlessdev/passwordless-nodejs');
const User = require('../models/User');
const SCOPES = require('../utility/scopes');
const jwt = require('jsonwebtoken');
const { signToken } = require('./authController');

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
  const user = req.user;

  if (!req.body.credentialId) {
    throw new ApiError(400, 'Please provide Credential Id!');
  }

  await _passwordlessClient.deleteCredential(
    Converters.base64UrlToUint8Array(req.body.credentialId)
  );

  const passkeyEncryptedEncryptionKeyIndex =
    user.passkeyEncryptedEncryptionKeys.findIndex(
      (passkeyEncryptedEncryptionKey) =>
        passkeyEncryptedEncryptionKey.credentialId === req.body.credentialId
    );

  if (passkeyEncryptedEncryptionKeyIndex != -1)
    user.passkeyEncryptedEncryptionKeys.splice(
      passkeyEncryptedEncryptionKeyIndex,
      1
    );

  await user.save();

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

exports.verifyReAuth = asyncHander(async (req, res) => {
  const user = req.user;

  if (!req.body.token) {
    throw new ApiError(400, 'Please provide token');
  }

  if (req.body.scope) {
    if (!Object.values(SCOPES).find((value) => req.body.scope === value)) {
      throw new ApiError(400, 'Invalid value of scope!');
    }
  }

  const verifiedUser = await _passwordlessClient.verifyToken(req.body.token);

  if (verifiedUser && verifiedUser.success) {
    if (verifiedUser.userId != user._id) {
      throw new ApiError(400, 'Passskey does not belong to current user!');
    }
  } else {
    throw new ApiError(400, 'Invalid Token');
  }

  if (req.body.scope) {
    const verifyToken = signReAuthToken(
      user._id,
      req.authToken,
      req.body.scope
    );

    res.status(200).json({
      status: 'success',
      verifyToken,
    });
  } else {
    res.status(200).json({
      status: 'success',
      verifyToken: true,
    });
  }
});

const signReAuthToken = (id, authToken, scope) => {
  return jwt.sign(
    { id, token_type: 'reAuth', authToken, scope },
    process.env.JWT_SECRET,
    {
      expiresIn: +process.env.RE_AUTH_TOKEN_JWT_EXPIRES_IN,
    }
  );
};

exports.getPasskeyEncryptedEncryptionKey = asyncHander(async (req, res) => {
  const user = req.user;

  if (!req.params.credentialId) {
    throw new ApiError(400, 'Please provide credentialId!');
  }

  const passkeyEncryptedEncryptionKey =
    user.passkeyEncryptedEncryptionKeys.find(
      (value) => value.credentialId === req.params.credentialId
    );

  if (!passkeyEncryptedEncryptionKey) {
    throw new ApiError(
      404,
      'passkeyEncryptedEncryptionKey with provided credentialId Not Found!'
    );
  }

  passkeyEncryptedEncryptionKey._id = undefined;
  passkeyEncryptedEncryptionKey.createdAt = undefined;
  passkeyEncryptedEncryptionKey.updatedAt = undefined;

  res.status(200).json({
    status: 'success',
    data: {
      credentialId: passkeyEncryptedEncryptionKey.credentialId,
      publicRSAKey: passkeyEncryptedEncryptionKey.publicRSAKey,
      encryptedPrivateRSAKey:
        passkeyEncryptedEncryptionKey.encryptedPrivateRSAKey,
      encryptedVaultEncryptionKey:
        passkeyEncryptedEncryptionKey.encryptedVaultEncryptionKey,
    },
  });
});

exports.verifySignIn = asyncHander(async (req, res) => {
  if (!req.body.token) {
    throw new ApiError(401, 'Token not provided!');
  }

  const verifiedUser = await _passwordlessClient.verifyToken(req.body.token);

  if (!(verifiedUser && verifiedUser.success)) {
    throw new ApiError(401, 'Invalid Token');
  }

  const user = await User.findById(verifiedUser.userId);

  if (!user) {
    throw new ApiError(
      401,
      'User with userId associated with this passkey not found!'
    );
  }

  //There is some issue on passwordless site it returns wrond credential Id,
  //So as of now not using this but later once it's fixed will use this
  /*if (
    !user.passkeyEncryptedEncryptionKeys.find(
      (value) => value.credentialId === verifiedUser.credentialId
    )
  ) {
    throw new ApiError(
      401,
      'encrypted vault encryption Key not found for this passkey!'
    );
  }*/

  const authToken = signToken(user._id);

  res.status(200).json({
    status: 'success',
    authToken,
    username: user.email,
  });
});
