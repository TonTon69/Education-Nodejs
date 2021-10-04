require("dotenv").config();

const path = require("path");
const express = require("express");
// const morgan = require("morgan");

const methodOverride = require("method-override");
// const moment = require("moment");
const session = require("express-session");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");

const route = require("./routes");
const db = require("./config/db");

// Connect db
db.connect();

const app = express();
// const port = 3000;

// Template engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "resources", "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// HTTP request logger middleware for node.js
// app.use(morgan("combined"));

app.use(cookieParser(process.env.SESSION_SECRET));

// Static file
app.use(express.static(path.join(__dirname, "public")));

app.use(methodOverride("_method"));

// app.locals.moment = moment;

//
app.use(
    session({
        cookie: { maxAge: 60000 },
        saveUninitialized: true,
        resave: "true",
        secret: "secret",
    })
);

app.use(flash());

// Route init
route(app);

app.use(function (req, res) {
    res.status(404).render("error");
});

let port = process.env.PORT || 3000;
var listener = app.listen(port, function () {
    console.log("Listening on port " + listener.address().port);
});
