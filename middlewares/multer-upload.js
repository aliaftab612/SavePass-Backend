const multer = require('multer');
const MulterNotImageTypeError = require('../utility/multerNotImageTypeError');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

function imageFilter(req, file, cb) {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new MulterNotImageTypeError('File should be an image!'), false);
  }
}

exports.uploadSingleImage = (fileFieldName) => (req, res, next) => {
  const upload = multer({
    storage,
    limits: { fileSize: 5242880, files: 1 },
    fileFilter: imageFilter,
  }).single(fileFieldName);

  upload(req, res, function (err) {
    let statusCode = 500;
    let errMsg = err;

    if (err) {
      switch (err.code) {
        case 'LIMIT_FILE_SIZE':
          statusCode = 413;
          errMsg = `${fileFieldName} should not be greater than 5MB!`;
          break;
        case 'NOT_IMAGE_TYPE':
          statusCode = 400;
          errMsg = errMsg.message;
          break;
        case 'LIMIT_FILE_COUNT':
          statusCode = 400;
          errMsg = `Only one file(${fileFieldName}) can be uploaded!`;
          break;
      }

      return res.status(statusCode).json({
        status: 'fail',
        message: statusCode === 500 ? 'MulterError : ' + errMsg : errMsg,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: `${fileFieldName} is mandatory`,
      });
    }
    next();
  });
};
