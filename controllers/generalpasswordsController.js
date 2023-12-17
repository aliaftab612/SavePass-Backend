const User = require('../models/User');
const APIFeatures = require('../utility/apiFeatures');
const asyncHander = require('../utility/asyncHandler');
const ApiError = require('../utility/ApiError');

exports.getAllGeneralPasswords = asyncHander(async (req, res) => {
  const user = req.user;

  const generalPasswordResults = new APIFeatures({ ...req.query }, [
    ...user.generalPasswords,
  ]).sortByDateCreatedOrDateUpdated();

  res.status(200).json({
    status: 'success',
    results: generalPasswordResults.generalPasswords.length,
    data: {
      generalPasswords: generalPasswordResults.generalPasswords,
    },
  });
});

exports.createGeneralPassword = asyncHander(async (req, res) => {
  const user = req.user;

  if (
    !(req.body && req.body.website && req.body.username && req.body.password)
  ) {
    throw new ApiError(400, 'website, username and password is mandatory');
  }

  const newGeneralPasword = {
    website: req.body.website,
    username: req.body.username,
    password: req.body.password,
  };

  const cretionDate = new Date();

  const generalPasswordsListLength = user.generalPasswords.push({
    ...newGeneralPasword,
    dateCreated: cretionDate,
    dateUpdated: cretionDate,
  });

  await user.save();

  newGeneralPasword._id =
    user.generalPasswords[generalPasswordsListLength - 1]._id;

  res.status(201).json({
    status: 'success',
    data: { generalPassword: newGeneralPasword },
  });
});

exports.getGeneralPassword = asyncHander(async (req, res) => {
  const user = req.user;

  const generalPassword = user.generalPasswords.find(
    (generalPassword) => generalPassword._id == req.params.id
  );

  if (!generalPassword) {
    throw new ApiError(
      404,
      'General Password with Id : ' + req.params.id + ' not found!'
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      generalPassword,
    },
  });
});

exports.deleteGeneralPassword = asyncHander(async (req, res) => {
  const user = req.user;
  let isGeneralPasswordDeleted = false;

  user.generalPasswords.every((element, index) => {
    if (element.id === req.params.id) {
      user.generalPasswords.splice(index, 1);
      isGeneralPasswordDeleted = true;

      return false;
    }

    return true;
  });

  await user.save();

  if (!isGeneralPasswordDeleted) {
    throw new ApiError(
      404,
      'General Password with Id : ' + req.params.id + ' not found!'
    );
  }

  res.status(204).json({
    status: 'success',
    data: {
      generalPassword: null,
    },
  });
});

exports.updateGeneralPassword = asyncHander(async (req, res) => {
  const user = req.user;
  let isGeneralPasswordUpdated = false;
  let generalPassword = null;

  if (!(req.body.website || req.body.username || req.body.password)) {
    throw new ApiError(400, 'website or username or password is mandatory');
  }

  const website = req.body.website;
  const username = req.body.username;
  const password = req.body.password;

  user.generalPasswords.every((element) => {
    if (element._id == req.params.id) {
      if (website) {
        element.website = website;
      }
      if (username) {
        element.username = username;
      }
      if (password) {
        element.password = password;
      }
      generalPassword = element;
      isGeneralPasswordUpdated = true;
      element.dateUpdated = new Date();

      return false;
    }

    return true;
  });

  await user.save();

  if (!isGeneralPasswordUpdated) {
    throw new ApiError(
      404,
      'General Password with Id : ' + req.params.id + ' not found!'
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      generalPassword,
    },
  });
});
