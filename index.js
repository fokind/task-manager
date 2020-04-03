"use strict";

require("dotenv").config();

const express = require("express");
const { KanbanServer } = require("./lib/odata/server");

const app = express();

const port = process.env.PORT;
app.use(express.static("./src/webapp"));
app.use("/odata", KanbanServer.create());

app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
