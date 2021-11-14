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
const Exercise = require("./app/models/Exercise");
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

    // console.log(socket.id + " connected");

    // console.log(socket.adapter.rooms);

    // handle out room
    socket.on("client-handle-out-room", async (data) => {
        const room = await Room.findOne({ roomName: data });
        // nếu là chủ phòng
        if (socket.id === room.socketID) {
            io.sockets.in(data).emit("master-handle-out-room");
            await Room.deleteOne({ roomName: data });

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
        } else {
            // nếu ko phải là chủ phòng
            await Room.updateOne(
                { roomName: data },
                {
                    status: "Đang chờ...",
                    $pull: {
                        members: {
                            socketID: socket.id,
                        },
                    },
                }
            );
            const roomMembers = await Room.findOne({ roomName: data });
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

            const roomMembersLength = await Room.findOne({ roomName: data });
            io.sockets
                .in(data)
                .emit(
                    "server-send-length-members-in-room",
                    roomMembersLength.members.length
                );

            io.sockets.emit("server-send-rooms", rooms);
            io.sockets
                .in(data)
                .emit("server-send-members-in-room", roomMembers.members);
        }
    });

    // ngắt kết nối
    socket.on("disconnect", async () => {
        if ($ipsConnected.hasOwnProperty($ipAddress)) {
            delete $ipsConnected[$ipAddress];
            connected_socket--;
            socket.emit("server-send-counter", connected_socket);
        }

        const rooms = await Room.find({});
        rooms.forEach(async (room) => {
            if (room.socketID === socket.id) {
                if (room.members.length > 0) {
                    await Room.deleteOne({ socketID: socket.id });
                    const roomsNew = await Room.aggregate([
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

                    io.sockets.emit("server-send-rooms", roomsNew);
                    io.sockets.in(room.roomName).emit("master-handle-out-room");
                }
            } else {
                if (room.status === "Full") {
                    room.members.forEach(async (member) => {
                        if (member.socketID === socket.id) {
                            await Room.updateOne(
                                { _id: room._id },
                                {
                                    status: "Đang chờ...",
                                    $pull: {
                                        members: {
                                            socketID: socket.id,
                                        },
                                    },
                                }
                            );

                            const roomMembers = await Room.findOne({
                                roomName: room.roomName,
                            });
                            const roomsNew = await Room.aggregate([
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

                            io.sockets.emit("server-send-rooms", roomsNew);
                            io.sockets
                                .in(room.roomName)
                                .emit(
                                    "server-send-members-in-room",
                                    roomMembers.members
                                );
                        }
                    });
                } else if (room.status === "Đang thi...") {
                    room.members.forEach(async (member) => {
                        if (member.socketID === socket.id) {
                            await Room.updateOne(
                                { _id: room._id },
                                {
                                    $pull: {
                                        members: {
                                            socketID: socket.id,
                                        },
                                    },
                                }
                            );

                            const roomMembers = await Room.findOne({
                                roomName: room.roomName,
                            });
                            const roomsNew = await Room.aggregate([
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

                            io.sockets.emit("server-send-rooms", roomsNew);
                            io.sockets
                                .in(room.roomName)
                                .emit(
                                    "server-send-members-in-room",
                                    roomMembers.members
                                );
                        }
                    });
                }
            }
        });
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

    // handle typing messages
    socket.on("writing-message", (data) => {
        countMessage = 0;
        io.sockets.emit("user-writing-message", data);
        socket.emit("server-send-count-message", countMessage);
    });

    // handle stopping messages
    socket.on("stopping-message", () => {
        io.sockets.emit("user-stopping-message");
    });

    // create room
    socket.on("create-room", async (data) => {
        var roomId = data.username;
        socket.join(roomId);
        socket.room = roomId;

        // save db
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
        // console.log(socket.adapter.rooms);
    });

    // user tham gia vào phòng
    socket.on("client-send-room-name", async (data) => {
        socket.join(data.roomId);

        const room = await Room.findOne({ roomName: data.roomId });
        if (room) {
            if (room.roomName === data.userName) {
                // user là chủ phòng
                await room.update({ socketID: socket.id });
            } else {
                // user ko phải là chủ phòng
                let flag = false;
                room.members.forEach((member) => {
                    if (member.userName === data.userName) {
                        flag = true;
                    }
                });

                if (flag) {
                    await Room.updateOne(
                        { roomName: room.roomName },
                        {
                            $pull: {
                                members: {
                                    userName: data.userName,
                                },
                            },
                        }
                    );
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
                                            fullname: data.fullname,
                                        },
                                    ],
                                },
                            },
                        }
                    );
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
                                            fullname: data.fullname,
                                        },
                                    ],
                                },
                            },
                        }
                    );
                }

                const roomMembers = await Room.findOne({
                    roomName: data.roomId,
                });

                if (roomMembers.members.length === 1) {
                    await roomMembers.update({ status: "Full" });
                }

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
                io.sockets
                    .in(data.roomId)
                    .emit("server-send-members-in-room", roomMembers.members);
            }

            const roomMembers = await Room.findOne({ roomName: data.roomId });
            io.sockets
                .in(data.roomId)
                .emit(
                    "server-send-length-members-in-room",
                    roomMembers.members.length
                );
        }
    });

    // user chọn khối => môn học
    socket.on("user-send-option-grade", async (data) => {
        const subjects = await Subject.find({ gradeID: data });
        socket.emit("server-send-list-subject-of-user-grade-option", subjects);
    });

    // user chọn môn học => chuyên đề
    socket.on("user-send-option-subject", async (data) => {
        const units = await Unit.aggregate([
            { $match: { subjectID: ObjectId(data) } },
        ]);
        socket.emit("server-send-list-unit-of-user-subject-option", units);
    });

    // user chọn chuyên đề => bài học
    socket.on("user-send-option-unit", async (data) => {
        const lessions = await Lession.aggregate([
            { $match: { unitID: ObjectId(data) } },
        ]);
        socket.emit("server-send-list-lession-of-user-unit-option", lessions);
    });

    // tìm kiếm theo khối
    socket.on("user-filter-option-grade", async (data) => {
        const rooms = await Room.aggregate([
            {
                $match: { gradeID: parseInt(data) },
            },
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

        socket.emit("server-send-rooms", rooms);
    });

    // tìm kiếm theo tên chủ phòng
    socket.on("user-search", async (data) => {
        if (data !== "") {
            const rooms = await Room.aggregate([
                {
                    $match: {
                        master: { $regex: data, $options: "$i" },
                    },
                },
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

            socket.emit("server-send-rooms", rooms);
        } else {
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

            socket.emit("server-send-rooms", rooms);
        }
    });

    // start-room
    socket.on("handle-start-room", async (data) => {
        io.sockets.in(data).emit("server-send-starting", data);
        await Room.updateOne({ roomName: data, status: "Đang thi..." });

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
    });

    socket.on("room-request-questions", async (data) => {
        const room = await Room.findOne({ roomName: data });
        if (room) {
            const questions = await Exercise.aggregate([
                {
                    $match: { lessionID: ObjectId(room.lessionID) },
                },
                {
                    $lookup: {
                        from: "exercise-categories",
                        localField: "ceID",
                        foreignField: "_id",
                        as: "cate",
                    },
                },
            ]);
            io.sockets.in(data).emit("server-send-question", questions);
        }
    });
});

let port = process.env.PORT || 3000;
var listener = server.listen(port, function () {
    console.log("Listening on port " + listener.address().port);
});
