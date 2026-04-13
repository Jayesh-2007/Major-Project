const loadEnv = require("./utils/loadEnv");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

loadEnv();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "listScope",
    allowedFormats: ["png", "jpg", "jpeg"], // supports promises as well
  },
});

module.exports = {
  cloudinary,
  storage,
};
