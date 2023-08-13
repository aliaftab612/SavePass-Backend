const User = require('../models/User');
const exceptionHandler = require('../utility/exceptionHandler');
const jwt = require('jsonwebtoken');
const RevokedToken = require('../models/RevokedToken');

exports.signup = async (req, res, next) => {
  try {
    // Check if username and password is provid in req.body then continue else return bad request
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password',
      });
    }

    if (!req.body.hashIterations) {
      return res.status(400).json({
        status: 'fail',
        message:
          'Please provide number of iterations used while hashing master password!',
      });
    }

    const creationDate = new Date();

    // Create new user
    const newUser = new User();
    newUser.email = req.body.email;
    newUser.password = await newUser.hashPassword(req.body.password);
    newUser.dateUserCreated = creationDate;
    newUser.dateUserUpdated = creationDate;
    newUser.userSettings.hashIterations = req.body.hashIterations;

    await newUser.save();

    // Create token
    const token = signToken(newUser._id);

    // Send response
    res.status(201).json({
      status: 'success',
      token,
    });
  } catch (ex) {
    exceptionHandler.handleException(ex, res);
  }
};

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: +process.env.JWT_EXPIRES_IN,
  });
};

exports.preLogin = async (req, res) => {
  try {
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
  } catch (ex) {
    exceptionHandler.handleException(ex, res);
  }
};

exports.login = async (req, res, next) => {
  try {
    // Check if username and password is provid in req.body then continue else return bad request
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password',
      });
    }

    // Check if user exists
    const user = await User.findOne({ email: req.body.email }).select(
      '+password +passwordHashingSalt'
    );

    // if user is not found then return error
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password',
      });
    }

    // Check if password is correct
    if (!(await user.comparePassword(req.body.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password',
      });
    }

    // If everything ok, send token to client
    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
    });
  } catch (ex) {
    exceptionHandler.handleException(ex, res);
  }
};

exports.protect = async (req, res, next) => {
  try {
    // Check if token is provided
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // If token is not provided then return error
    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in! Please log in to get access.',
      });
    }
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //Check if JWT is revoked
    const revokedToken = await RevokedToken.findOne({ token });

    if (revokedToken) {
      return res.status(401).json({
        status: 'fail',
        message: 'Token invalid!',
      });
    }

    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token does no longer exist.',
      });
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (ex) {
    if (ex instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        status: 'fail',
        message: 'Token invalid!',
      });
    }
    exceptionHandler.handleException(ex, res);
  }
};

exports.logout = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const revokedToken = new RevokedToken();
      revokedToken.token = token;
      revokedToken.expireAt = new Date(+decoded.exp * 1000);

      await revokedToken.save();
    }

    res.status(200).json({
      status: 'success',
    });
  } catch (ex) {
    if (ex instanceof jwt.JsonWebTokenError) {
      return res.status(200).json({
        status: 'success',
      });
    }
    exceptionHandler.handleException(ex, res);
  }
};
