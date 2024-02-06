const express = require("express");
const path = require("node:path");

const app = express();
const port = 3003;

app.use("/hinweissystem", express.static(path.join(__dirname, "..", "public")));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
