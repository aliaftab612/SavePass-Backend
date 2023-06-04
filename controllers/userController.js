const exceptionHandler = require('../utility/exceptionHandler');

exports.getUser = (req, res) => {
  try {
    req.user.generalPasswords = undefined;
    req.user.__v = undefined;

    res.status(200).json({
      status: 'success',
      data: {
        user: req.user,
      },
    });
  } catch (ex) {
    exceptionHandler.handleException(ex, res);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = req.user;

    if (
      !(req.body.firstName || req.body.lastName || req.body.profilePhotoUrl)
    ) {
      res.status(400).json({
        status: 'fail',
        message: 'Either name or profilePhotoUrl is mandatory',
      });
      return;
    }

    if (!req.body.firstName && req.body.lastName) {
      res.status(400).json({
        status: 'fail',
        message: 'firstName is mandatory when lastName is provided',
      });
      return;
    }

    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.profilePhotoUrl = req.body.profilePhotoUrl;
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
  } catch (ex) {
    exceptionHandler.handleException(ex, res);
  }
};
