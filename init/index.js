const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const buildMongoUrl = require("../utils/mongoUrl");

const DEFAULT_OWNER_ID = "69cff35c9bc9765be6c07b84";

async function main() {
  await mongoose.connect(buildMongoUrl());
}

const initDB = async () => {
  await Listing.deleteMany({});
  const listingsWithOwner = initData.data.map((obj) => ({
    ...obj,
    owner: DEFAULT_OWNER_ID,
  }));
  await Listing.insertMany(listingsWithOwner);
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
