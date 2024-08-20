const mongoose = require('mongoose');
const validator = require('validator');
const argon2 = require('argon2');
const crypto = require('crypto');
const cryptoHelpers = require('../utility/cryptoHelpers');

const passkeyEncryptedEncryptionKeysSchema = mongoose.Schema(
  {
    credentialId: {
      type: String,
      required: [true, 'credentialId is required!'],
    },
    publicRSAKey: {
      type: String,
      required: [true, 'publicRSAKey is required!'],
    },
    encryptedPrivateRSAKey: {
      type: String,
      required: [true, 'encryptedPrivateRSAKey is required!'],
    },
    encryptedVaultEncryptionKey: {
      type: String,
      required: [true, 'encryptedVaultEncryptionKey is required!'],
    },
  },
  {
    timestamps: true,
  }
);

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
    select: false,
  },
  userSettings: {
    hashIterations: {
      type: Number,
      required: [true, 'hashIterations is required!'],
    },
    appLockoutMinutes: {
      type: Number,
      default: 15,
    },
  },
  passwordHashingSalt: {
    type: String,
    required: [true, 'Salt is required!'],
    select: false,
  },
  authenticatorAppSecret: {
    type: String,
    select: false,
  },
  passkeyEncryptedEncryptionKeys: {
    type: [passkeyEncryptedEncryptionKeysSchema],
  },
});

userSchema.methods.hashPassword = async function (password) {
  this.passwordHashingSalt = crypto.randomBytes(32).toString('hex');

  const key = await cryptoHelpers.performExtraHashingOnLoginHash(
    password,
    this.passwordHashingSalt
  );

  return await argon2.hash(key);
};

userSchema.methods.comparePassword = async function (password) {
  const key = await cryptoHelpers.performExtraHashingOnLoginHash(
    password,
    this.passwordHashingSalt
  );

  return await argon2.verify(this.password, key);
};

const User = new mongoose.model('User', userSchema);

module.exports = User;
