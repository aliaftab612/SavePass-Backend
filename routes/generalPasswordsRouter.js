const express = require('express');
const generalpasswordsController = require('../controllers/generalpasswordsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .get(generalpasswordsController.getAllGeneralPasswords)
  .post(generalpasswordsController.createGeneralPassword);

router
  .route('/:id')
  .get(generalpasswordsController.getGeneralPassword)
  .delete(generalpasswordsController.deleteGeneralPassword)
  .patch(generalpasswordsController.updateGeneralPassword);

module.exports = router;
