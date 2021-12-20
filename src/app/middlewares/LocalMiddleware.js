const User = require("../models/User");
const Subject = require("../models/Subject");
const Blog = require("../models/Blog");
const Notification = require("../models/Notification");
const Question = require("../models/Question");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

module.exports = {
    userLocal: async function (req, res, next) {
        try {
            const user = await User.aggregate([
                { $match: { _id: ObjectId(req.signedCookies.userId) } },
                {
                    $lookup: {
                        from: "roles",
                        localField: "roleID",
                        foreignField: "_id",
                        as: "role",
                    },
                },
            ]);
            res.locals.user = user;
            next();
        } catch (error) {
            console.log(error);
        }
    },

    search: async function (req, res, next) {
        try {
            const searchString = req.body.query;
            if (searchString.length > 0) {
                const seacrchSubjects = await Subject.find({
                    name: { $regex: searchString, $options: "$i" },
                });
                const searchBlogs = await Blog.find({
                    title: { $regex: searchString, $options: "$i" },
                });
                const searchQa = await Question.aggregate([
                    {
                        $match: {
                            title: { $regex: searchString, $options: "$i" },
                        },
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "userID",
                            foreignField: "_id",
                            as: "user",
                        },
                    },
                ]);
                res.render("helper/search", {
                    seacrchSubjects,
                    searchBlogs,
                    searchQa,
                });
            }
        } catch (error) {
            req.flash("error", "Không tìm thấy kết quả!");
        }
    },

    notification: async function (req, res, next) {
        try {
            const user = await User.findById(req.signedCookies.userId);
            if (user) {
                const notifications = await Notification.aggregate([
                    { $match: { receiverID: ObjectId(user._id) } },
                    {
                        $lookup: {
                            from: "users",
                            localField: "senderID",
                            foreignField: "_id",
                            as: "sender",
                        },
                    },
                    {
                        $lookup: {
                            from: "questions",
                            localField: "sourceID",
                            foreignField: "_id",
                            as: "question",
                        },
                    },
                    { $sort: { createdAt: -1 } },
                ]);
                const countNotifUnread = await Notification.countDocuments({
                    receiverID: user._id,
                    isRead: false,
                });
                res.locals.notifications = notifications;
                res.locals.countNotifUnread = countNotifUnread;
            } else {
                res.locals.notifications = [];
                res.locals.countNotifUnread = 0;
            }
            next();
        } catch (error) {
            console.log(error);
        }
    },
};
