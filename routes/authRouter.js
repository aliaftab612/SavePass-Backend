const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/prelogin', authController.preLogin);
router.post(
  '/verify-password',
  authController.protect,
  authController.checkMasterPassword
);

module.exports = router;
