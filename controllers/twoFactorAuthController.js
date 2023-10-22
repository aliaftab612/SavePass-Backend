const User = require('../models/User');
const exceptionHandler = require('../utility/exceptionHandler');
const speakeasy = require('speakeasy');

exports.getTwoFactorProvidersEnabledStatus = async (req, res) => {
  try {
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
  } catch (ex) {
    exceptionHandler.handleException(ex, res);
  }
};

exports.getAuthenticator = async (req, res) => {
  try {
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
  } catch (ex) {
    exceptionHandler.handleException(ex, res);
  }
};

exports.setAuthenticator = async (req, res) => {
  try {
    const secret = req.body.secret;
    const token = req.body.token;
    const user = req.user;

    if (!secret || !token) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide secret and token',
      });
    }

    if (
      (await User.findById(user._id).select('+authenticatorAppSecret'))
        .authenticatorAppSecret
    ) {
      return res.status(400).json({
        status: 'fail',
        message: 'Authenticator already set!',
      });
    }

    if (
      !speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 1,
      })
    ) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid Token!',
      });
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
  } catch (ex) {
    exceptionHandler.handleException(ex, res);
  }
};

exports.disableAuthenticator = async (req, res) => {
  try {
    req.user.authenticatorAppSecret = undefined;
    await req.user.save();

    res.status(200).json({
      status: 'success',
      data: {
        enabled: false,
      },
    });
  } catch (ex) {
    exceptionHandler.handleException(ex, res);
  }
};
