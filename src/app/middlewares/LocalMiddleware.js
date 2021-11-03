const User = require("../models/User");
const Subject = require("../models/Subject");
const Blog = require("../models/Blog");
const System = require("../models/System");
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
                res.render("helper/search", { seacrchSubjects, searchBlogs });
            }
        } catch (error) {
            req.flash("error", "Không tìm thấy kết quả!");
        }
    },
};
