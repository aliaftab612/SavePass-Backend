const express = require('express');
const generalpasswordsRouter = require('./routes/generalPasswordsRouter');
const authRouter = require('./routes/authRouter');
const userRouter = require('./routes/userRouter');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanaitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

const app = express();

app.use(
  '/api',
  rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!',
  })
);

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(cookieParser());

app.use(express.json({ limit: '10kb' }));

app.use(mongoSanaitize());

app.use(xss());

app.use(hpp());

app.use('/api/v1', authRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/general-passwords', generalpasswordsRouter);
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'Route not found!',
  });
});

module.exports = app;
