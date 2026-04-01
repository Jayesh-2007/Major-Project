const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("GET: for index route");
});

router.post("/", (req, res) => {
  res.send("POST: for the ");
});

router.get("/:id", (req, res) => {
  res.send("GET: for show ");
});

router.delete("/", (req, res) => {
  res.send("DELETE: for ");
});

module.exports = router;
