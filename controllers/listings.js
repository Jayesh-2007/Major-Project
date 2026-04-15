const Listing = require("../models/listing");
const { listingSchema } = require("../schema");
const ExpressError = require("../utils/ExpressError");
const geocodeListingLocation = require("../utils/geocode");

module.exports.index = async (req, res) => {
  const listings = await Listing.find();
  res.render("./listings/index.ejs", { listings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListings = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested does not exist");
    return res.redirect("/listings");
  }

  const hasGeometry =
    listing.geometry &&
    Array.isArray(listing.geometry.coordinates) &&
    listing.geometry.coordinates.length === 2;

  if (!hasGeometry && (listing.location || listing.country)) {
    try {
      listing.geometry = await geocodeListingLocation(listing);
      await listing.save();
    } catch (error) {
      console.log("Unable to backfill listing coordinates:", error.message);
    }
  }

  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
  let url = req.file.path;
  let filename = req.file.filename;

  let result = listingSchema.validate(req.body);
  console.log(result);
  if (result.error) {
    throw new ExpressError(result.error, 400);
  }
  const newListing = new Listing(req.body.listing);

  try {
    newListing.geometry = await geocodeListingLocation(req.body.listing);
  } catch (error) {
    console.log("Unable to geocode listing during create:", error.message);
    req.flash("error", "Listing was created, but map coordinates could not be fetched right now.");
  }

  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  req.flash("success", "New Listing Created!");
  await newListing.save();
  res.redirect("/listings");
};

module.exports.updateListingForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested does not exist");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");

  res.render("listings/edit.ejs", { listing, originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  if (!req.body.listing) {
    throw new ExpressError("Sent valid data for listing", 400);
  }
  const updateData = { ...req.body.listing };

  try {
    updateData.geometry = await geocodeListingLocation(req.body.listing);
  } catch (error) {
    console.log("Unable to geocode listing during update:", error.message);
    req.flash("error", "Listing was updated, but map coordinates could not be refreshed right now.");
  }

  let listing = await Listing.findByIdAndUpdate(id, updateData);

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findByIdAndDelete(id);
  if (!listing) {
    req.flash("error", "Listing you requested does not exist");
    return res.redirect("/listings");
  }
  res.redirect("/listings");
};
