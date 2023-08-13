const mongoose = require('mongoose');

const revokedTokenSchema = mongoose.Schema({
  token: {
    type: String,
    required: [true, 'Token is required!'],
  },
  expireAt: {
    type: Date,
    expires: 0,
    required: [true, 'expireAt is required'],
  },
});

const RevokedToken = new mongoose.model('RevokedToken', revokedTokenSchema);

module.exports = RevokedToken;
