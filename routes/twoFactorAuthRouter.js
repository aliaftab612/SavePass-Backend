const { Router } = require('express');
const authController = require('../controllers/authController');
const twoFactorAuthController = require('../controllers/twoFactorAuthController');
const SCOPES = require('../utility/scopes');

const router = new Router();

router.use(authController.protect);

router.get('/', twoFactorAuthController.getTwoFactorProvidersEnabledStatus);

router.use(
  authController.scopeResolver.bind({ scope: SCOPES.MANAGE_TOTP_2FA }),
  authController.verifyMasterPassword
);

router.post('/get-authenticator', twoFactorAuthController.getAuthenticator);
router.patch('/authenticator', twoFactorAuthController.setAuthenticator);
router.patch(
  '/disable-authenticator',
  twoFactorAuthController.disableAuthenticator
);

module.exports = router;
