const { Router } = require('express');
const {
  protect,
  verifyMasterPassword,
  scopeResolver,
} = require('../controllers/authController');
const {
  passkeysRegistrationBegin,
  passkeysRegistrationComplete,
  getUserPasskeyCredentials,
  deleteUserPasskeyCredential,
  savePasskeyEncryptedEncryptionKey,
  verifyReAuth,
} = require('../controllers/passkeysAuthController');
const SCOPES = require('../utility/scopes');

const router = new Router();

router.use(protect);

router.post('/re-auth/verify', verifyReAuth);
router.get('/credentials/list', getUserPasskeyCredentials);

router.delete(
  '/credentials/delete',
  scopeResolver.bind({ scope: SCOPES.REMOVE_PASSKEY }),
  verifyMasterPassword,
  deleteUserPasskeyCredential
);

router.use(
  scopeResolver.bind({ scope: SCOPES.CREATE_PASSKEY }),
  verifyMasterPassword
);

router.post('/signup/begin', passkeysRegistrationBegin);
router.post('/signup/complete', passkeysRegistrationComplete);
router.post(
  '/passkey-encrypted-encryption-key',
  savePasskeyEncryptedEncryptionKey
);

module.exports = router;
