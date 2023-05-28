const express = require('express');
const usersController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .get(usersController.getUser)
  .patch(usersController.updateUser);

module.exports = router;
