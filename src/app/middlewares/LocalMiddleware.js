const User = require("../models/User");
const Subject = require("../models/Subject");
const Blog = require("../models/Blog");

module.exports = {
    userLocal: async function (req, res, next) {
        try {
            const user = await User.findOne({ _id: req.signedCookies.userId });
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
