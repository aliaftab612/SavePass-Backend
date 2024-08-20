const { Router } = require('express');
const { protect } = require('../controllers/authController');
const {
  passkeysRegistrationBegin,
  passkeysRegistrationComplete,
  getUserPasskeyCredentials,
  deleteUserPasskeyCredential,
  savePasskeyEncryptedEncryptionKey,
} = require('../controllers/passkeysAuthController');

const router = new Router();

router.post('/signup/begin', protect, passkeysRegistrationBegin);
router.post('/signup/complete', protect, passkeysRegistrationComplete);
router.get('/credentials/list', protect, getUserPasskeyCredentials);
router.delete('/credentials/delete', protect, deleteUserPasskeyCredential);
router.post(
  '/passkey-encrypted-encryption-key',
  protect,
  savePasskeyEncryptedEncryptionKey
);

module.exports = router;
