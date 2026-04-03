const crypto = require("crypto");
const { promisify } = require("util");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const pbkdf2Async = promisify(crypto.pbkdf2);
const randomBytesAsync = promisify(crypto.randomBytes);
const AUTH_ERROR_MESSAGE = "Password or username is incorrect";

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  hash: {
    type: String,
    select: false,
  },
  salt: {
    type: String,
    select: false,
  },
});

userSchema.methods.validatePassword = async function (password) {
  if (!this.salt || !this.hash) {
    return false;
  }

  const hashedPassword = await pbkdf2Async(password, this.salt, 25000, 512, "sha256");
  return crypto.timingSafeEqual(Buffer.from(this.hash, "hex"), hashedPassword);
};

userSchema.statics.register = async function (userData, password) {
  if (!password) {
    throw new Error("Password is required");
  }

  const user = userData instanceof this ? userData : new this(userData);
  const existingUser = await this.findOne({ username: user.username });

  if (existingUser) {
    const error = new Error("A user with the given username is already registered");
    error.name = "UserExistsError";
    throw error;
  }

  user.salt = (await randomBytesAsync(32)).toString("hex");
  user.hash = (await pbkdf2Async(password, user.salt, 25000, 512, "sha256")).toString("hex");

  return user.save();
};

userSchema.statics.authenticate = function () {
  const User = this;

  return async (username, password, done) => {
    try {
      const user = await User.findOne({ username }).select("+hash +salt");

      if (!user || !(await user.validatePassword(password))) {
        return done(null, false, { message: AUTH_ERROR_MESSAGE });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  };
};

userSchema.statics.serializeUser = function () {
  return (user, done) => done(null, user.id);
};

userSchema.statics.deserializeUser = function () {
  const User = this;

  return async (id, done) => {
    try {
      const user = await User.findById(id);
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  };
};

module.exports = mongoose.model("User", userSchema);
