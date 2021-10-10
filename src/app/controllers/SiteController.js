const Subject = require("../models/Subject");
const Grade = require("../models/Grade");
const User = require("../models/User");
const Banner = require("../models/Banner");
const Blog = require("../models/Blog");
const BlogCategory = require("../models/BlogCategory");
const Report = require("../models/Report");
const bcrypt = require("bcrypt");
class SiteController {
    // [GET]/
    async index(req, res, next) {
        try {
            const subjects = await Subject.find({}).limit(6);
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
                    $limit: 6,
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
            const user = await User.findOne({ _id: req.signedCookies.userId });
            res.render("infor", {
                user,
                success: req.flash("success"),
            });
        } catch (error) {
            res.render("error");
        }
    }

    // [GET]/subjects
    subjects(req, res, next) {
        Promise.all([Subject.find({}), Grade.find({})])
            .then(([subjects, grades]) => {
                res.render("subjects", { subjects, grades });
            })
            .catch(next);
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

        // const matchPassword = await bcrypt.compare(password, user.password);
        if (password != user.password) {
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

        res.cookie("userId", user.id, {
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
        const url = req.originalUrl;
        console.log(url);
        const user = await User.findOne({ _id: req.signedCookies.userId });
        const report = new Report({
            userID: user.id,
            content: req.body.content,
            summary: req.body.summary,
        });
        await report.save();
        req.flash("success", "Bạn đã báo cáo thành công. Cảm ơn!");
        res.redirect(`${url}`);
    }
}

module.exports = new SiteController();
