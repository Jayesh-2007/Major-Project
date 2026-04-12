const User = require("../models/user.js");

module.exports.signup = async (req, res, next) => {
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
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = (req, res) => {
  const redirectUrl = req.session.redirectUrl || "/listings";
  delete req.session.redirectUrl;
  req.flash("success", "Welcome back to WanderLust!");
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out.");
    res.redirect("/listings");
  });
};
