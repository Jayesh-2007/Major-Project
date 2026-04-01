const express = require("express");
const router = express.Router();

// s
// index router
router.get("/", (req, res) => {
  res.send("GET: for index ");
});

// 
router.post("/", (req, res) => {
  res.send("POST: for the post");
});

// show
router.get("/:id", (req, res) => {
  res.send("GET: for show post");
});

// delete
router.delete("/", (req, res) => {
  res.send("DELETE: for post");
});

module.exports = router;
