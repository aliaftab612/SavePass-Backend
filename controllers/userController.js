const ApiError = require('../utility/ApiError');
const asyncHander = require('../utility/asyncHandler');

exports.getUser = (req, res) => {
  req.user.generalPasswords = undefined;
  req.user.__v = undefined;
  req.user.passkeyEncryptedEncryptionKeys = undefined;

  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
};

exports.updateUser = asyncHander(async (req, res) => {
  const user = req.user;

  if (!req.body.firstName) {
    throw new ApiError(400, 'firstName is mandatory!');
  }

  user.firstName = req.body.firstName;
  user.lastName = req.body.lastName;
  user.dateUserUpdated = new Date();

  await user.save();
  user.generalPasswords = undefined;
  req.user.__v = undefined;

  res.status(200).json({
    status: 'success',
    data: {
      user: user,
    },
  });
});

//Need to move to userSettings route once we create more settings.
exports.updateAppLockoutTime = asyncHander(async (req, res) => {
  const user = req.user;

  if (!req.body.appLockoutMinutes) {
    throw new ApiError(400, 'appLockoutMinutes is mandatory.');
  }

  if (!Number(req.body.appLockoutMinutes)) {
    throw new ApiError(400, 'appLockoutMinutes should be a number.');
  }

  user.userSettings.appLockoutMinutes = req.body.appLockoutMinutes;
  await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      appLockoutMinutes: req.body.appLockoutMinutes,
    },
  });
});
