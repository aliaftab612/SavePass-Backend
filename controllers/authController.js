const User = require('../models/User');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const RevokedToken = require('../models/RevokedToken');
const asyncHander = require('../utility/asyncHandler');
const ApiError = require('../utility/ApiError');

exports.signup = asyncHander(async (req, res) => {
  // Check if username and password is provid in req.body then continue else return bad request
  if (!req.body.email || !req.body.password) {
    throw new ApiError(400, 'Please provide email and password');
  }

  if (!req.body.hashIterations) {
    throw new ApiError(
      400,
      'Please provide number of iterations used while hashing master password!'
    );
  }

  const creationDate = new Date();

  // Create new user
  const newUser = new User();
  newUser.email = req.body.email;
  newUser.password = await newUser.hashPassword(req.body.password);
  newUser.dateUserCreated = creationDate;
  newUser.dateUserUpdated = creationDate;
  newUser.userSettings.hashIterations = req.body.hashIterations;

  try {
    await newUser.save();
  } catch (err) {
    if (err.code && err.code === 11000) {
      throw new ApiError(409, 'Email Already Exists');
    }
  }

  // Create token
  const token = signToken(newUser._id);

  // Send response
  res.status(201).json({
    status: 'success',
    token,
  });
});

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: +process.env.JWT_EXPIRES_IN,
  });
};

exports.verifyMasterPassword = asyncHander(async (req, res, next) => {
  if (!req.body.password) {
    throw new ApiError(400, 'Please provide password');
  }

  const user = await User.findById(req.user._id).select(
    '+password +passwordHashingSalt'
  );

  if (!(await user.comparePassword(req.body.password))) {
    throw new ApiError(401, 'User Verfication Failed!');
  }

  next();
});

exports.preLogin = asyncHander(async (req, res) => {
  let hashIterations = 10000;
  if (req.body.email) {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      hashIterations = user.userSettings.hashIterations;
    }
  }

  return res.status(200).json({
    status: 'success',
    data: {
      hashIterations,
    },
  });
});

exports.login = asyncHander(async (req, res) => {
  // Check if username and password is provid in req.body then continue else return bad request
  if (!req.body.email || !req.body.password) {
    throw new ApiError(400, 'Please provide email and password');
  }

  // Check if user exists
  const user = await User.findOne({ email: req.body.email }).select(
    '+password +passwordHashingSalt +authenticatorAppSecret'
  );

  // if user is not found then return error
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Check if password is correct
  if (!(await user.comparePassword(req.body.password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (user.authenticatorAppSecret) {
    if (!req.body.twoFactorProvider || !req.body.twoFactorVerificationCode) {
      throw new ApiError(
        401,
        'Two Factor Authentication required, please provide twoFactorProvider and twoFactorVerificationCode',
        'twoFactorRequired'
      );
    }

    const [twoFactorVerified, status, errorMessage] = twoFactorVerification(
      user.authenticatorAppSecret,
      req.body.twoFactorProvider,
      req.body.twoFactorVerificationCode
    );

    if (!twoFactorVerified) {
      throw new ApiError(status, errorMessage);
    }
  }

  // If everything ok, send token to client
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

const twoFactorVerification = (
  authenticatorAppSecret,
  twoFactorProvider,
  twoFactorVerificationCode
) => {
  if (twoFactorProvider === 'AuthenticatorApp') {
    if (
      !speakeasy.totp.verify({
        secret: authenticatorAppSecret,
        encoding: 'base32',
        token: twoFactorVerificationCode,
        window: 1,
      })
    ) {
      return [false, 401, 'Invalid Authenticator App token!'];
    }
  } else {
    return [false, 400, `${twoFactorProvider} two factor provider not found!`];
  }

  return [true];
};

exports.protect = asyncHander(async (req, res, next) => {
  // Check if token is provided
  let token;
  let decoded;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If token is not provided then return error
  if (!token) {
    throw new ApiError(
      401,
      'You are not logged in! Please log in to get access.'
    );
  }
  // Verify token
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      throw new ApiError(401, 'Token invalid!');
    }

    throw err;
  }

  //Check if JWT is revoked
  const revokedToken = await RevokedToken.findOne({ token });

  if (revokedToken) {
    throw new ApiError(401, 'Token invalid!');
  }

  // Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    throw new ApiError(
      401,
      'The user belonging to this token does no longer exist.'
    );
  }

  // Grant access to protected route
  req.user = currentUser;
  next();
});

exports.logout = asyncHander(async (req, res) => {
  let token;
  let decoded;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err instanceof jwt.JsonWebTokenError) {
        return res.status(200).json({
          status: 'success',
        });
      }
      throw err;
    }

    const revokedToken = new RevokedToken();
    revokedToken.token = token;
    revokedToken.expireAt = new Date(+decoded.exp * 1000);

    await revokedToken.save();
  }

  res.status(200).json({
    status: 'success',
  });
});
