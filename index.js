const express = require("express");
const app = express();
const mongoose = require("mongoose");
const buildMongoUrl = require("./utils/mongoUrl");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// mognoose connection
async function main() {
  await mongoose.connect(buildMongoUrl());
}

main()
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(8080, () => {
      console.log("Server is running on port 8080");
    });
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
    process.exit(1);
  });

// set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

const sessionOptions = {
  secret: "secret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};
app.use(session(sessionOptions));
app.use(flash());

// passport configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// flash middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

// app.get("/demouser", async (req, res) => {
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username: "student-02",
//   });

//   let registeredUser = await User.register(fakeUser, "helloworld");
//   res.send(registeredUser);
// });

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// home route
app.get("/", (req, res) => {
  res.send("Home page");
});

app.all("/{*splat}", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// error handling middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", {
    err,
    statusCode,
    message,
  });
});

