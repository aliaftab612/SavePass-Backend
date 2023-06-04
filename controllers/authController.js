const User = require('../models/User');
const exceptionHandler = require('../utility/exceptionHandler');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res, next) => {
  try {
    // Check if username and password is provid in req.body then continue else return bad request
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password',
      });
    }

    // Create new user
    const newUser = new User();
    newUser.email = req.body.email;
    newUser.password = await newUser.hashPassword(req.body.password);

    await newUser.save();

    // Create token
    const token = signToken(newUser._id);

    res.cookie('jwt', token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production' ? true : false,
      maxAge: process.env.JWT_EXPIRES_IN * 1000,
    });

    res.cookie('isAuthenticated', true, {
      httpOnly: false,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production' ? true : false,
      maxAge: process.env.JWT_EXPIRES_IN * 1000,
    });

    // Send response
    res.status(201).json({
      status: 'success',
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
      '+password'
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

    res.cookie('jwt', token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production' ? true : false,
      maxAge: process.env.JWT_EXPIRES_IN * 1000,
      priority: 'high',
      domain: '.web.app',
    });

    res.cookie('isAuthenticated', true, {
      httpOnly: false,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production' ? true : false,
      maxAge: process.env.JWT_EXPIRES_IN * 1000,
      priority: 'high',
      domain: '.web.app',
    });

    res.status(200).json({
      status: 'success',
    });
  } catch (ex) {
    exceptionHandler.handleException(ex, res);
  }
};

exports.protect = async (req, res, next) => {
  try {
    // Check if token is provided
    let token;
    if (req.cookies.jwt) {
      token = req.cookies.jwt;
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
    res.cookie('jwt', 'loggedout', {
      hhttpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production' ? true : false,
      expires: new Date(Date.now()),
    });

    res.cookie('isAuthenticated', false, {
      httpOnly: false,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production' ? true : false,
      expires: new Date(Date.now()),
    });

    res.status(200).json({
      status: 'success',
    });
  } catch (ex) {
    exceptionHandler.handleException(ex, res);
  }
};
