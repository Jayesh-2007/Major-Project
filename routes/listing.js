const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { listingSchema } = require("../schema");
const ExpressError = require("../utils/ExpressError");
const Listing = require("../models/listing");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

router.get(
  "/",
  wrapAsync(async (req, res) => {
    const listings = await Listing.find();
    res.render("./listings/index.ejs", { listings });
  }),
);

// Create route
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new.ejs");
});

router.post(
  "/",
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res) => {
    let result = listingSchema.validate(req.body);
    console.log(result);
    if (result.error) {
      throw new ExpressError(result.error, 400);
    }
    const newListing = new Listing(req.body.listing);

    newListing.owner = req.user._id;
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
    const listing = await Listing.findById(id)
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("owner");
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
  isLoggedIn,
  isOwner,
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
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(async (req, res) => {
    if (!req.body.listing) {
      throw new ExpressError("Sent valid data for listing", 400);
    }
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  }),
);

// Delete route
router.delete(
  "/:id",
  isOwner,
  isLoggedIn,
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
