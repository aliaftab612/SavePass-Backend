const express = require('express');
const profilePhotoController = require('../controllers/profilePhotoController');
const authController = require('../controllers/authController');
const { uploadSingleImage } = require('../middlewares/multer-upload');

const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .post(
    uploadSingleImage('profile-photo'),
    profilePhotoController.uploadProfilePhoto
  )
  .delete(profilePhotoController.deleteProfilePhoto);

module.exports = router;
