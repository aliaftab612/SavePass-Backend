const { uploadFile, deleteFile } = require('../utility/cloudinary');
const asyncHander = require('../utility/asyncHandler');
const ApiError = require('../utility/ApiError');

exports.uploadProfilePhoto = asyncHander(async (req, res) => {
  const [uploadedResponse, errMsg] = await uploadFile(req.file.path);

  if (uploadedResponse) {
    const user = req.user;
    user.profilePhotoUrl = uploadedResponse.secure_url;
    await user.save();

    res.status(200).json({
      status: 'success',
      data: {
        profilePhotoUrl: uploadedResponse.secure_url,
      },
    });
  } else {
    throw new ApiError(500, errMsg);
  }
});

exports.deleteProfilePhoto = asyncHander(async (req, res) => {
  const user = req.user;

  if (!user.profilePhotoUrl) {
    return res.status(204).json({
      status: 'success',
      data: null,
    });
  }

  const [deleteResponse, errMsg] = await deleteFile(
    user.profilePhotoUrl,
    'image'
  );

  if (deleteResponse) {
    user.profilePhotoUrl = undefined;
    await user.save();

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } else {
    throw new ApiError(500, errMsg);
  }
});
