"use strict";

require("dotenv").config();

const express = require("express");

const app = express();

const port = process.env.PORT;
app.use(express.static("./webapp"));

app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
