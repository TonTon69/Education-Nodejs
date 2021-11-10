require("dotenv").config();

const path = require("path");
const express = require("express");
// const morgan = require("morgan");

const methodOverride = require("method-override");
const moment = require("moment");
const session = require("express-session");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");

const { userLocal } = require("./app/middlewares/LocalMiddleware");

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

// Custom middleware
app.use(userLocal);

app.locals.moment = moment;

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

//socket
const server = require("http").Server(app);
const io = require("socket.io")(server);

let countMessage = 0;
let counter = 0;
var $ipsConnected = [];

io.on("connection", (socket) => {
    // var $liveIpAddress = socket.handshake.address;
    // if (!$ipsConnected.hasOwnProperty($liveIpAddress)) {
    //     $ipsConnected[$liveIpAddress] = 1;
    //     counter++;
    //     socket.emit("getCounter", counter);
    // }

    // socket.on("disconnect", function () {
    //     if ($ipsConnected.hasOwnProperty($liveIpAddress)) {
    //         delete $ipsConnected[$liveIpAddress];
    //         counter--;
    //         socket.emit("getCounter", counter);
    //     }
    // });

    // chat all
    socket.on("user-send-message", (data) => {
        countMessage++;
        io.sockets.emit("server-send-message", data);
        io.sockets.emit("server-send-count-message", countMessage);
    });

    socket.on("writing-message", (data) => {
        io.sockets.emit("user-writing-message", data);
    });

    socket.on("stopping-message", () => {
        io.sockets.emit("user-stopping-message");
    });

    // create room
    socket.on("create-room", (data) => {
        var roomId = data.username;
        socket.join(roomId);
        socket.room = roomId;

        io.sockets.emit("server-send-rooms", data);
    });
});

let port = process.env.PORT || 3000;
var listener = server.listen(port, function () {
    console.log("Listening on port " + listener.address().port);
});
