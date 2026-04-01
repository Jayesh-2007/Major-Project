const express = require("express");
const app = express();
const users = require("./routes/user");
const post = require("./routes/post");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");

// set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const sessionOptions = {
  secret: "mysupersecret",
  resave: false,
  saveUninitialized: true,
};

app.use(session(sessionOptions));
app.use(flash());
app.use((req, res, next) => {
  res.locals.successMsg = req.flash("success");
  res.locals.errorMsg = req.flash("error");
  next();
});

app.get("/", (req, res) => {
  res.send("Hi, I am root!");
});

app.get("/register", (req, res) => {
  let { name = "anonymous" } = req.query;
  req.session.name = name;
  if (name == "anonymous") {
    req.flash("error", "Error: enter name without name you don't register!");
  } else {
    req.flash("success", "User registered successfully!");
  }
  res.redirect("/hello");
});

app.get("/hello", (req, res) => {
  res.render("page.ejs", { name: req.session.name });
});

// app.get("/getcount", (req, res) => {
//   if (req.session.count) {
//     req.session.count++;
//   } else {
//     req.session.count = 1;
//   }
//   res.send(`You send a request ${req.session.count} times`);
// });

app.get("/test", (req, res) => {
  res.send("test successful~");
});

app.use("/users", users);
app.use("/post", post);

app.listen(3000, () => {
  console.log("server is listening on 3000");
});
