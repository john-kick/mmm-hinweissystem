const express = require("express");
const path = require("path");

const router = express.Router();

router.get("/audio/*", (req, res) => {
  res.set("Content-Type", "audio/mpeg");
  res.sendFile(path.join(__dirname, "..", "public", "audio", req.params[0]));
});

router.get("/soundConfig/*", (req, res) => {
  const filePath = path.join(__dirname, "..", "soundConfig", req.params[0]);
  res.set("Content-Type", "application/json");
  res.sendFile(filePath);
});

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

router.get("/styles.css", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "styles.css"));
});

router.get("/dist/index.js", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "dist", "index.js"));
});

router.get("/dist/*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "public", "dist", req.params[0] + ".js")
  );
});

module.exports = router;
