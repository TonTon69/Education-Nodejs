const Subject = require("../models/Subject");
const Grade = require("../models/Grade");
const User = require("../models/User");
const Banner = require("../models/Banner");
const Blog = require("../models/Blog");
const bcrypt = require("bcrypt");
class SiteController {
    // [GET]/
    async index(req, res, next) {
        try {
            const subjects = await Subject.find({})
                .sort({ location: -1 })
                .limit(6);
            const banners = await Banner.find({});
            const blogs = await Blog.find({}).sort({ view: -1 }).limit(6);
            const blogIDArray = blogs.map(({ _id }) => _id);
            const users = await User.find({ userID: { $in: blogIDArray } });

            res.render("index", {
                users,
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
            res.render("infor", { user });
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
}

module.exports = new SiteController();
