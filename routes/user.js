const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const User = require("../models/user.js");
const passport = require("passport");
const { saveRedirecUrl } = require("../middleware.js");

router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

router.post(
  "/signup",
  wrapAsync(async (req, res, next) => {
    const { username, email, password } = req.body.user || {};

    if (!username || !email || !password) {
      req.flash("error", "Username, email, and password are required.");
      return res.redirect("/signup");
    }

    try {
      const newUser = new User({ username, email });
      const registeredUser = await User.register(newUser, password);
      req.login(registeredUser, (err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "Welcome to WanderLust!");
        res.redirect("/listings");
      });
    } catch (err) {
      if (err.name === "UserExistsError") {
        req.flash("error", "That username is already taken.");
        return res.redirect("/signup");
      }
      return next(err);
    }
  }),
);

router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

router.post(
  "/login",
  saveRedirecUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    const redirectUrl = req.session.redirectUrl || "/listings";
    delete req.session.redirectUrl;
    req.flash("success", "Welcome back to WanderLust!");
    res.redirect(redirectUrl);
  },
);

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out.");
    res.redirect("/listings");
  });
});

module.exports = router;
