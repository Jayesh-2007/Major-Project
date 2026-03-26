const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const MONGO_URL =
  process.env.MONGO_URL || "mongodb://127.0.0.1:27017/listingsdb";

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});
  await Listing.insertMany(initData.data);
  console.log("Database initialized with sample data");
};

main()
  .then(async () => {
    console.log("Connected to MongoDB");
    await initDB();
    await mongoose.connection.close();
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });
