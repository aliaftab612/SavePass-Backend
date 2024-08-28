const { Router } = require('express');
const {
  protect,
  protectSensitive,
  scopeResolver,
} = require('../controllers/authController');
const {
  passkeysRegistrationBegin,
  passkeysRegistrationComplete,
  getUserPasskeyCredentials,
  deleteUserPasskeyCredential,
  savePasskeyEncryptedEncryptionKey,
  verifyReAuth,
  getPasskeyEncryptedEncryptionKey,
  verifySignIn,
} = require('../controllers/passkeysAuthController');
const SCOPES = require('../utility/scopes');

const router = new Router();

router.post('/signin/verify', verifySignIn);

router.use(protect);

router.post('/re-auth/verify', verifyReAuth);
router.get('/credentials/list', getUserPasskeyCredentials);
router.get(
  '/passkey-encrypted-encryption-key/:credentialId',
  getPasskeyEncryptedEncryptionKey
);

router.delete(
  '/credentials/delete',
  scopeResolver.bind({ scope: SCOPES.REMOVE_PASSKEY }),
  protectSensitive,
  deleteUserPasskeyCredential
);

router.use(
  scopeResolver.bind({ scope: SCOPES.CREATE_PASSKEY }),
  protectSensitive
);

router.post('/signup/begin', passkeysRegistrationBegin);
router.post('/signup/complete', passkeysRegistrationComplete);
router.post(
  '/passkey-encrypted-encryption-key',
  savePasskeyEncryptedEncryptionKey
);

module.exports = router;
