const mongoose = require('mongoose');
const validator = require('validator');
const argon2 = require('argon2');

const generalPasswordsSchema = mongoose.Schema({
  website: {
    type: String,
    required: [true, 'Website is required!'],
  },
  username: {
    type: String,
    required: [true, 'Username is required!'],
  },
  password: {
    type: String,
    required: [true, 'Password is required!'],
  },
  dateCreated: {
    type: Date,
    default: new Date(),
  },
  dateUpdated: {
    type: Date,
    default: new Date(),
  },
});

const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    unique: [true, 'Duplicate username not allowed!'],
    required: [true, 'Email is required!'],
    validate: {
      validator: (value) => validator.isEmail(value),
      message: 'Invalid email!',
    },
  },
  profilePhotoUrl: String,
  generalPasswords: [generalPasswordsSchema],
  dateUserCreated: {
    type: Date,
    default: new Date(),
  },
  dateUserUpdated: {
    type: Date,
    default: new Date(),
  },
  password: {
    type: String,
    required: [true, 'Password is required!'],
    min: [8, 'Password must be at least 8 characters!'],
    max: [20, 'Password must be at most 20 characters!'],
    select: false,
  },
});

userSchema.methods.hashPassword = async function (password) {
  return await argon2.hash(password);
};

userSchema.methods.comparePassword = async function (password) {
  return await argon2.verify(this.password, password);
};

const User = new mongoose.model('User', userSchema);

module.exports = User;