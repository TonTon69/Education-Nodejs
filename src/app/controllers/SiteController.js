const Subject = require("../models/Subject");
const Grade = require("../models/Grade");
const User = require("../models/User");
const Banner = require("../models/Banner");
const Blog = require("../models/Blog");
const BlogCategory = require("../models/BlogCategory");
const Statistical = require("../models/Statistical");
const Report = require("../models/Report");
const System = require("../models/System");
const Unit = require("../models/Unit");
const Exercise = require("../models/Exercise");
const Lession = require("../models/Lession");
const bcrypt = require("bcrypt");
class SiteController {
    // [GET]/
    async index(req, res, next) {
        try {
            const subjects = await Subject.find({});
            const banners = await Banner.find({});

            const blogs = await Blog.aggregate([
                {
                    $lookup: {
                        from: "users",
                        localField: "userID",
                        foreignField: "_id",
                        as: "User",
                    },
                },
                { $sort: { view: -1 } },
                {
                    $limit: 8,
                },
            ]);

            res.render("index", {
                banners,
                subjects,
                blogs,
            });
        } catch (error) {
            res.render("error");
        }
    }

    // [GET]/infor
    async infor(req, res, next) {
        try {
            res.render("auth/infor", {
                success: req.flash("success"),
                errors: req.flash("error"),
            });
        } catch (error) {
            res.render("error");
        }
    }

    // [GET]/subjects
    async subjects(req, res, next) {
        const subjects = await Subject.find({});
        const grades = await Grade.find({});
        res.render("subjects", { subjects, grades });
    }

    // [GET]/login
    login(req, res, next) {
        res.render("login", {
            errors: req.flash("error"),
            success: req.flash("success"),
        });
    }

    // [POST]/login
    async postLogin(req, res, next) {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });
        if (!user) {
            req.flash("error", "Người dùng có email này không tồn tại!");
            res.render("login", {
                values: req.body,
                errors: req.flash("error"),
            });
            return;
        }

        const matchPassword = await bcrypt.compare(password, user.password);
        if (!matchPassword) {
            req.flash("error", "Mật khẩu của bạn không khớp!");
            res.render("login", {
                values: req.body,
                errors: req.flash("error"),
            });
            retrun;
        }

        const isActive = user.active;
        if (!isActive) {
            req.flash("error", "Tài khoản của bạn chưa được kích hoạt!");
            res.render("login", {
                errors: req.flash("error"),
            });
            return;
        }

        res.cookie("userId", user._id, {
            signed: true,
        });
        res.redirect("/");
    }

    // [GET]/logout
    logout(req, res) {
        res.clearCookie("userId");
        res.clearCookie("sessionId");
        res.redirect("/");
    }

    // [GET]/blog
    async blog(req, res, next) {
        try {
            const categories = await BlogCategory.find({});

            const blogs = await Blog.aggregate([
                {
                    $lookup: {
                        from: "users",
                        localField: "userID",
                        foreignField: "_id",
                        as: "User",
                    },
                },
                { $sort: { view: -1 } },
            ]);

            res.render("blog", {
                blogs,
                categories,
            });
        } catch (err) {
            res.render("error");
        }
    }

    // [POST]/report
    async report(req, res) {
        const user = await User.findOne({ _id: req.signedCookies.userId });
        const report = new Report({
            userID: user.id,
            content: req.body.content,
            summary: req.body.summary,
        });
        await report.save();
        req.flash("success", "Bạn đã báo cáo thành công. Cảm ơn!");
        res.redirect("back");
    }

    // [GET]/admin
    async admin(req, res) {
        const countUsers = await User.countDocuments({});
        const countSubjects = await Subject.countDocuments({});
        const countUnits = await Unit.countDocuments({});
        const countLessions = await Lession.countDocuments({});
        const countExercises = await Exercise.countDocuments({});
        const countBlogs = await Blog.countDocuments({});

        const top6 = await Statistical.aggregate([
            {
                $group: {
                    _id: "$userID",
                    totalScore: { $sum: "$score" },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user",
                },
            },
            {
                $project: {
                    "user.birthDay": 0,
                    "user.active": 0,
                    "user.password": 0,
                    "user.phone": 0,
                    "user.roleID": 0,
                    "user.address": 0,
                    "user.username": 0,
                },
            },
            { $sort: { totalScore: -1 } },
            { $limit: 6 },
        ]);

        res.render("admin-index", {
            countUsers,
            countSubjects,
            countUnits,
            countLessions,
            countExercises,
            countBlogs,
            top6,
        });
    }

    // [GET]/about
    async about(req, res, next) {
        try {
            const systems = await System.find({});
            const countUsers = await User.countDocuments({});
            const countExercises = await Exercise.countDocuments({});
            const countUnits = await Unit.countDocuments({});
            res.render("about", {
                systems,
                countUsers,
                countExercises,
                countUnits,
            });
        } catch (err) {
            res.render("error");
        }
    }

    // [GET]/competition
    async competition(req, res, next) {
        res.render("competition");
    }
}

module.exports = new SiteController();
