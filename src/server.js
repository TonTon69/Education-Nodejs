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
const { messages } = require("./utils/message-data");
const Subject = require("./app/models/Subject");
const Unit = require("./app/models/Unit");
const Lession = require("./app/models/Lession");
const Room = require("./app/models/Room");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

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

var countMessage = 0;
var connected_socket = 0;
var $ipsConnected = [];

io.on("connection", async (socket) => {
    var $ipAddress = socket.handshake.address;
    if (!$ipsConnected.hasOwnProperty($ipAddress)) {
        $ipsConnected[$ipAddress] = 1;
        connected_socket++;
        socket.emit("server-send-counter", connected_socket);
    }

    console.log(socket.id + " connected");

    console.log(socket.adapter.rooms);

    socket.on("disconnect", () => {
        if ($ipsConnected.hasOwnProperty($ipAddress)) {
            delete $ipsConnected[$ipAddress];
            connected_socket--;
            socket.emit("server-send-counter", connected_socket);
        }

        console.log(socket.id + " disconnected");
    });

    // chat all
    socket.on("user-send-message", (data) => {
        countMessage++;
        let message = data.message;
        messages.forEach((item) => {
            if (message.toLowerCase().includes(item)) {
                message = message.replace(item, "***");
                return;
            }
        });
        data.message = message;

        io.sockets.emit("server-send-message", data);
        socket.broadcast.emit("server-send-count-message", countMessage);
    });

    socket.on("writing-message", (data) => {
        countMessage = 0;
        io.sockets.emit("user-writing-message", data);
        socket.emit("server-send-count-message", countMessage);
    });

    socket.on("stopping-message", () => {
        io.sockets.emit("user-stopping-message");
    });

    // create room
    socket.on("create-room", async (data) => {
        var roomId = data.username;
        socket.join(roomId);
        socket.room = roomId;

        const room = new Room({
            roomName: roomId,
            socketID: socket.id,
            master: data.name,
            avatar: data.avatar,
            gradeID: data.grade,
            subjectID: data.subject,
            unitID: data.unit,
            lessionID: data.lession,
        });
        await room.save();

        const rooms = await Room.aggregate([
            {
                $lookup: {
                    from: "subjects",
                    localField: "subjectID",
                    foreignField: "_id",
                    as: "subject",
                },
            },
            {
                $lookup: {
                    from: "units",
                    localField: "unitID",
                    foreignField: "_id",
                    as: "unit",
                },
            },
            {
                $lookup: {
                    from: "lessions",
                    localField: "lessionID",
                    foreignField: "_id",
                    as: "lession",
                },
            },
        ]);
        io.sockets.emit("server-send-rooms", rooms);
        socket.emit("room-id", roomId);
        // io.sockets.emit("server-send-data-in-room", data);
        console.log(socket.adapter.rooms);
    });

    socket.on("client-send-room-name", async (data) => {
        socket.join(data.roomId);
        const room = await Room.findOne({ roomName: data.roomId });
        if (room) {
            if (room.roomName === data.userName) {
                await room.update({ socketID: socket.id });
            } else {
                await Room.updateOne(
                    { roomName: room.roomName },
                    {
                        $push: {
                            members: {
                                $each: [
                                    {
                                        socketID: socket.id,
                                        userName: data.userName,
                                        avatar: data.avatar,
                                    },
                                ],
                            },
                        },
                    }
                );
            }
        }
        console.log(socket.adapter.rooms);
    });

    socket.on("user-send-option-grade", async (data) => {
        const subjects = await Subject.find({ gradeID: data });
        socket.emit("server-send-list-subject-of-user-grade-option", subjects);
    });

    socket.on("user-send-option-subject", async (data) => {
        const units = await Unit.aggregate([
            { $match: { subjectID: ObjectId(data) } },
        ]);
        socket.emit("server-send-list-unit-of-user-subject-option", units);
    });

    socket.on("user-send-option-unit", async (data) => {
        const lessions = await Lession.aggregate([
            { $match: { unitID: ObjectId(data) } },
        ]);
        socket.emit("server-send-list-lession-of-user-unit-option", lessions);
    });

    // filter
    socket.on("user-filter-option-grade", (data) => {
        if (data !== "") {
            let roomsFilter = [];
            rooms.forEach((room) => {
                if (room.grade === `Khối ${data}`) {
                    roomsFilter.push(room);
                }
            });
            socket.emit("server-send-rooms", roomsFilter);
        } else {
            socket.emit("server-send-rooms", rooms);
        }
    });

    // search
    socket.on("user-search", (data) => {
        if (data !== "") {
            let roomsSearch = [];
            rooms.forEach((room) => {
                if (room.name.toLowerCase().includes(data.toLowerCase())) {
                    roomsSearch.push(room);
                }
            });

            socket.emit("server-send-rooms", roomsSearch);
        } else {
            socket.emit("server-send-rooms", rooms);
        }
    });
});

let port = process.env.PORT || 3000;
var listener = server.listen(port, function () {
    console.log("Listening on port " + listener.address().port);
});
