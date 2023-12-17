const User = require('../models/User');
const speakeasy = require('speakeasy');
const asyncHander = require('../utility/asyncHandler');
const ApiError = require('../utility/ApiError');

exports.getTwoFactorProvidersEnabledStatus = asyncHander(async (req, res) => {
  const user = req.user;
  const secret = (
    await User.findById(user._id).select('+authenticatorAppSecret')
  ).authenticatorAppSecret;

  res.status(200).json({
    status: 'success',
    data: {
      authenticatorAppEnabled: Boolean(secret),
    },
  });
});

exports.getAuthenticator = asyncHander(async (req, res) => {
  let enabled = true;
  let secret = (
    await User.findById(req.user._id).select('+authenticatorAppSecret')
  ).authenticatorAppSecret;

  if (!secret) {
    secret = speakeasy.generateSecret().base32;
    enabled = false;
  }

  res.status(200).json({
    status: 'success',
    data: {
      enabled,
      secret,
    },
  });
});

exports.setAuthenticator = asyncHander(async (req, res) => {
  const secret = req.body.secret;
  const token = req.body.token;
  const user = req.user;

  if (!secret || !token) {
    throw new ApiError(400, 'Please provide secret and token');
  }

  if (
    (await User.findById(user._id).select('+authenticatorAppSecret'))
      .authenticatorAppSecret
  ) {
    throw new ApiError(400, 'Authenticator already set!');
  }

  if (
    !speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 1,
    })
  ) {
    throw new ApiError(400, 'Invalid Token!');
  }

  user.authenticatorAppSecret = secret;
  await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      enabled: true,
      secret,
    },
  });
});

exports.disableAuthenticator = asyncHander(async (req, res) => {
  req.user.authenticatorAppSecret = undefined;
  await req.user.save();

  res.status(200).json({
    status: 'success',
    data: {
      enabled: false,
    },
  });
});
