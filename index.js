const express = require("express");
const app = express();
const mongoose = require("mongoose");
const MONGO_URL = "mongodb://localhost:27017/listingsdb";
const Listing = require("./models/listing");
const ejs = require("ejs");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");

// mognoose connection
async function main() {
  await mongoose.connect(MONGO_URL);
}

main()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });

// set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

// home route
app.get("/", (req, res) => {
  res.send("Home page");
});

app.get("/listings", async (req, res) => {
  const listings = await Listing.find();
  res.render("./listings/index.ejs", { listings });
});

// Create route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

app.post("/listings", wrapAsync(async (req, res) => {

    const newListing = await new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  }
)); 

// Show route
app.get("/listings/:id", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
});

// Update route
app.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
});

app.put("/listings/:id", async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
});

// Delete route
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
});

// error handling middleware
app.use((err, req, res, next) => {
  res.send("Something went wrong");
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
