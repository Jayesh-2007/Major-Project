const express = require("express");
const router = express.Router({ mergeParams: true });
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync");
const Listing = require("../models/listing.js");
const {
  validateReview,
  isLoggedIn,
  isReviewAuthor,
} = require("../middleware.js");

// Reviews
// post route
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    if (!listing) {
      req.flash(
        "error",
        "Cannot add a review because the listing no longer exists",
      );
      return res.redirect("/listings");
    }
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
  }),
);

// delete route
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });
    if (!listing) {
      req.flash(
        "error",
        "Cannot delete that review because the listing no longer exists",
      );
      return res.redirect("/listings");
    }

    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) {
      req.flash("error", "Review you requested does not exist");
      return res.redirect(`/listings/${id}`);
    }

    res.redirect(`/listings/${id}`);
  }),
);

module.exports = router;
