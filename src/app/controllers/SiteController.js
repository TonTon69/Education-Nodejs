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
const Room = require("../models/Room");
const Rank = require("../models/Rank");
const Question = require("../models/Question");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const cloudinary = require("../../config/cloud/index");
class SiteController {
    // [GET]/
    async index(req, res) {
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
    async infor(req, res) {
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
    async subjects(req, res) {
        const subjects = await Subject.find({});
        const grades = await Grade.find({});

        const statisticals = await Statistical.aggregate([
            {
                $match: { userID: ObjectId(req.signedCookies.userId) },
            },
        ]);

        let subjectsStudying = [];
        if (statisticals.length > 0) {
            const statisticalsIdArr = statisticals.map(
                ({ lessionID }) => lessionID
            );

            const lessions = await Lession.find({
                _id: { $in: statisticalsIdArr },
            });

            const lessionsIdArr = lessions.map(({ unitID }) => unitID);

            const units = await Unit.find({ _id: { $in: lessionsIdArr } });

            const unitsIdArr = units.map(({ subjectID }) => subjectID);

            subjectsStudying = await Subject.find({
                _id: { $in: unitsIdArr },
            });
        }
        res.render("subjects", { subjects, grades, subjectsStudying });
    }

    // [GET]/login
    login(req, res) {
        res.render("login", {
            errors: req.flash("error"),
            success: req.flash("success"),
        });
    }

    // [POST]/login
    async postLogin(req, res) {
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
            return;
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
    async blog(req, res) {
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

        const top3 = await Statistical.aggregate([
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
            { $limit: 3 },
        ]);

        const ranks = await Rank.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "userID",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $sort: { score: -1, victory: -1 } },
            { $limit: 3 },
        ]);

        res.render("admin-index", {
            countUsers,
            countSubjects,
            countUnits,
            countLessions,
            countExercises,
            countBlogs,
            top3,
            ranks,
        });
    }

    // [GET]/about
    async about(req, res) {
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
    async competition(req, res) {
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

        // load ranks in competition
        const ranksCompetition = await Rank.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "userID",
                    foreignField: "_id",
                    as: "user",
                },
            },
            {
                $sort: { score: -1, victory: -1 },
            },
        ]);

        // const rankMe = ranksCompetition.find({
        //     userID: ObjectId(req.signedCookies.userId),
        // });
        // console.log(rankMe);

        res.render("competition", {
            rooms,
            ranksCompetition,
        });
    }

    // [GET]/qa
    async qa(req, res) {
        const qas = await Question.aggregate([
            { $match: { isApproved: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "userID",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $sort: { view: -1 } },
        ]);

        res.render("qa", {
            qas,
        });
    }

    // [GET]/new-question
    async newQuestion(req, res) {
        res.render("qa/new-question");
    }

    // [POST]/new-question
    async postNewQuestion(req, res) {
        if (req.file === undefined) {
            const { title, content } = req.body;
            const question = new Question({
                title,
                content,
                userID: ObjectId(req.signedCookies.userId),
            });
            await question.save();
            req.flash(
                "success",
                "Cảm ơn bạn đã đăng câu hỏi! Hệ thống đã gửi bài viết cho quản trị viên phê duyệt."
            );
            res.redirect("/my-qa");
        } else {
            req.body.thumbnail = req.file.path.split("/").slice(-2).join("/");
            cloudinary.uploader.upload(req.file.path, async (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    const { title, content } = req.body;
                    const question = new Question({
                        title,
                        content,
                        userID: ObjectId(req.signedCookies.userId),
                        thumbnail: result.url,
                    });
                    await question.save();
                    req.flash(
                        "success",
                        "Cảm ơn bạn đã đăng câu hỏi! Hệ thống đã gửi bài viết cho quản trị viên phê duyệt."
                    );
                    res.redirect("/my-qa");
                }
            });
        }
    }

    // [GET]/my-qa
    async storedQa(req, res) {
        const myQa = await Question.find({
            userID: ObjectId(req.signedCookies.userId),
        });

        const countMyQaWait = await Question.countDocuments({
            userID: ObjectId(req.signedCookies.userId),
            isApproved: false,
        });
        const countMyQaPublish = await Question.countDocuments({
            userID: ObjectId(req.signedCookies.userId),
            isApproved: true,
        });
        res.render("qa/my-stored", {
            myQa,
            countMyQaWait,
            countMyQaPublish,
            success: req.flash("success"),
        });
    }
}

module.exports = new SiteController();
