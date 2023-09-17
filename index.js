require("dotenv").config();
const express = require("express");
const cors = require("cors");

const router = require("./src/routes");

const app = express();

const port = 4000;

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

app.use("/api/v1/", router);

app.listen(port, () => console.log(`Listening on http://localhost:${port}!`));
