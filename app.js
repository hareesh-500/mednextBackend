const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.SERVER_PORT || 8080;
const router = require("./back_end/routers");
const cors = require("cors");
const db = require("./back_end/db/connection");
Logger = require("./back_end/config/logger")

//To send json data along with request
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//To resolve cors issue
var corsOptions = {
    credentials: "include",
    withCredentials: true,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE",
};
app.use(cors(corsOptions));

// simple route
app.get("/", (req, res) => {
    console.log("app getting");
    res.send("<h2>Welcome to Medleymed.</h2>");
});

// To initialize all our routes
require("./back_end/routers")(app);

app.listen(port, () => {
    console.log("app is running on port ", port);
});
