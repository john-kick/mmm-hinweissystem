const express = require("express");
const path = require("path");

const app = express();
const port = 3000;

app.get("/audio/*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "audio", req.params[0]));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.get("/styles.css", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "styles.css"));
});

app.get("/dist/index.js", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "dist", "index.js"));
});

app.get("/dist/*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "public", "dist", req.params[0] + ".js")
  );
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
