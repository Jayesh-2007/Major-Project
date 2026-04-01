const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { listingSchema } = require("../schema");
const ExpressError = require("../utils/ExpressError");
const Listing = require("../models/listing");

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  console.log(error);
  if (error) {
    let errorMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(errorMsg, 400);
  } else {
    next();
  }
};

router.get(
  "/",
  wrapAsync(async (req, res) => {
    const listings = await Listing.find();
    res.render("./listings/index.ejs", { listings });
  }),
);

// Create route
router.get("/new", (req, res) => {
  res.render("listings/new.ejs");
});

router.post(
  "/",
  validateListing,
  wrapAsync(async (req, res) => {
    let result = listingSchema.validate(req.body);
    console.log(result);
    if (result.error) {
      throw new ExpressError(result.error, 400);
    }
    const newListing = await new Listing(req.body.listing);
    req.flash("success", "New Listing Created!");
    await newListing.save();
    res.redirect("/listings");
  }),
);

// Show route
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
      req.flash("error", "Listing you requested does not exist");
      return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
  }),
);

// Update route
router.get(
  "/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing you requested does not exist");
      return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
  }),
);

router.put(
  "/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    if (!req.body.listing) {
      throw new ExpressError("Sent valid data for listing", 400);
    }
    let { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if (!listing) {
      req.flash("error", "Listing you requested does not exist");
      return res.redirect("/listings");
    }
    res.redirect(`/listings/${id}`);
  }),
);

// Delete route
router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findByIdAndDelete(id);
    if (!listing) {
      req.flash("error", "Listing you requested does not exist");
      return res.redirect("/listings");
    }
    res.redirect("/listings");
  }),
);

module.exports = router;
