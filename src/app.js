const express = require("express");
const routes = require("./routes");
require("dotenv").config();

const app = express();
const port = process.env.PORT;

app.use("/hinweissystem/", routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
