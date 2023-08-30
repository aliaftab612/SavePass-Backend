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

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'script-src-attr': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", '*', 'data:'],
      },
    },
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(
    cors({
      origin: process.env.DEVELOPMENT_CORS_ORIGIN,
      credentials: true,
    })
  );
}

app.use(cookieParser());

app.use(express.json({ limit: '10kb' }));

app.use(mongoSanaitize());

app.use(xss());

app.use(hpp());

app.use(express.static(`frontend`));

app.use('/api/v1', authRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/general-passwords', generalpasswordsRouter);
app.use('*', (req, res) => {
  res.sendFile(`index.html`, { root: `frontend` });
});

module.exports = app;
