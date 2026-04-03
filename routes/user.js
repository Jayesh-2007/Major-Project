const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const User = require("../models/user.js");
const passport = require("passport");

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
      console.log(registeredUser);
      req.flash("success", "User was registered successfully!");
      res.redirect("/listings");
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
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Welcome back to WanderLust!");
    res.redirect("/listings");
  },
);

module.exports = router;
