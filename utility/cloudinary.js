const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const canAccessFile = (filePath) => {
  return new Promise((resolve) => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

const uplodadFile = async (localFilePath) => {
  if (!(await canAccessFile(localFilePath))) {
    return [false, 'File Upload Exception: File Not Accessible!'];
  }
  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    });
    return [response, null];
  } catch (err) {
    return [false, 'File Upload Exception: ' + err.message];
  } finally {
    fs.unlinkSync(localFilePath);
  }
};

module.exports = uplodadFile;
