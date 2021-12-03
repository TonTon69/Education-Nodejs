const Subject = require("../models/Subject");
const Unit = require("../models/Unit");
const Lession = require("../models/Lession");
const System = require("../models/System");
const Exercise = require("../models/Exercise");
const Theory = require("../models/Theory");
const Statistical = require("../models/Statistical");
const Result = require("../models/Result");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const slugify = require("slugify");
const readXlsxFile = require("read-excel-file/node");
const path = require("path");
class SubjectController {
    // [GET]/subjects/:slug
    async show(req, res) {
        try {
            const ratingRegulation = await System.findOne({
                field: "rating_regulations",
            });
            const subject = await Subject.findOne({ slug: req.params.slug });
            const units = await Unit.find({ subjectID: subject._id });
            const unitIdArray = units.map(({ _id }) => _id);
            const lessions = await Lession.find({
                unitID: { $in: unitIdArray },
            }).sort({ lessionNumber: 1 });
            const lessionIdArray = lessions.map(({ _id }) => _id);
            // bảng xếp hạng theo môn học
            const ranks = await Statistical.aggregate([
                {
                    $match: {
                        lessionID: { $in: lessionIdArray },
                    },
                },
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
                        "user.email": 0,
                        "user.active": 0,
                        "user.password": 0,
                        "user.phone": 0,
                        "user.roleID": 0,
                        "user.address": 0,
                        "user.username": 0,
                    },
                },
                { $sort: { totalScore: -1 } },
                { $limit: 10 },
            ]);

            res.render("subjects/show", {
                subject,
                units,
                lessions,
                ratingRegulation,
                ranks,
            });
        } catch (error) {
            res.render("error");
        }
    }

    // [GET]/subjects/list
    async list(req, res) {
        let perPage = 3;
        let page = req.params.page || 1;
        const subjects = await Subject.find({})
            .sort({ gradeID: -1 })
            .skip(perPage * page - perPage)
            .limit(perPage);
        const subjectsCount = await Subject.countDocuments();
        res.render("subjects/list", {
            subjects,
            current: page,
            pages: Math.ceil(subjectsCount / perPage),
            success: req.flash("success"),
            errors: req.flash("error"),
        });
    }

    // [GET]/subjects/list/:page
    async pagination(req, res) {
        let perPage = 3;
        let page = req.params.page || 1;
        const subjects = await Subject.find({})
            .sort({ gradeID: -1 })
            .skip(perPage * page - perPage)
            .limit(perPage);
        const subjectsCount = await Subject.countDocuments();
        res.render("subjects/list", {
            subjects,
            current: page,
            pages: Math.ceil(subjectsCount / perPage),
            success: req.flash("success"),
            errors: req.flash("error"),
        });
    }

    // [POST]/subjects/list
    async searchFilter(req, res) {
        try {
            const searchString = req.body.query;
            const option = req.body.option;
            let subjects = [];
            if (searchString) {
                subjects = await Subject.find({
                    name: { $regex: searchString, $options: "$i" },
                }).sort({ gradeID: -1 });
            } else if (option) {
                subjects = await Subject.find({ gradeID: option });
            } else {
                subjects = await Subject.find({}).sort({ gradeID: -1 });
            }
            res.render("helper/table", { subjects });
        } catch (error) {
            console.log(error);
            req.flash("error", "Không tìm thấy kết quả!");
        }
    }

    // [GET]/subjects/create
    async create(req, res) {
        res.render("subjects/create", {
            success: req.flash("success"),
            errors: req.flash("error"),
        });
    }

    // [POST]/subjects/create
    async postCreate(req, res) {
        const { name, gradeID } = req.body;
        const findSubject = await Subject.findOne({
            name: name,
            gradeID: gradeID,
        });
        if (findSubject) {
            req.flash(
                "error",
                "Môn học này đã tồn tại... Vui lòng nhập môn học khác!"
            );
            res.redirect("back");
            return;
        }

        const subject = new Subject(req.body);
        await subject.save();
        req.flash("success", "Thêm mới thành công!");
        res.redirect("back");
    }

    // [GET]/subjects/:id/edit
    async edit(req, res) {
        const subject = await Subject.findById(req.params.id);
        res.render("subjects/edit", {
            subject,
            success: req.flash("success"),
            errors: req.flash("error"),
        });
    }

    // [PUT]/subjects/:id
    async update(req, res) {
        const { name, gradeID } = req.body;
        const findSubject = await Subject.findOne({
            name: name,
            gradeID: gradeID,
        });
        if (findSubject) {
            req.flash(
                "error",
                "Môn học này đã tồn tại... Vui lòng nhập môn học khác!"
            );
            res.redirect("back");
            return;
        }

        await Subject.updateOne(
            { _id: req.params.id },
            {
                name: name,
                gradeID: gradeID,
                slug: slugify(name.toLowerCase() + "-" + gradeID.toLowerCase()),
            }
        );
        req.flash("success", "Cập nhật thành công!");
        res.redirect("back");
    }

    // [DELETE]/subjects/:id
    async delete(req, res) {
        const units = await Unit.find({ subjectID: req.params.id });
        if (units.length > 0) {
            const unitsIdArr = units.map(({ _id }) => _id);
            const lessions = await Lession.find({
                unitID: { $in: unitsIdArr },
            });

            if (lessions.length > 0) {
                const lessionsIdArr = lessions.map(({ _id }) => _id);
                await Exercise.deleteMany({
                    lessionID: { $in: lessionsIdArr },
                });
                await Theory.deleteMany({ lessionID: { $in: lessionsIdArr } });
                await Lession.deleteMany({ unitID: { $in: unitsIdArr } });

                const statisticals = await Statistical.find({
                    lessionID: { $in: lessionsIdArr },
                });

                if (statisticals.length > 0) {
                    const statisticalsIdArr = statisticals.map(
                        ({ _id }) => _id
                    );
                    await Result.deleteMany({
                        statisticalID: { $in: statisticalsIdArr },
                    });
                    await Statistical.deleteMany({
                        lessionID: { $in: lessionsIdArr },
                    });
                }
            }

            await Unit.deleteMany({ subjectID: req.params.id });
        }

        await Subject.deleteOne({ _id: req.params.id });

        req.flash("success", "Xóa thành công!");
        res.redirect("back");
    }

    // [GET]/subjects/:id/content
    async content(req, res) {
        const subject = await Subject.findById(req.params.id);
        const units = await Unit.find({ subjectID: subject._id });
        const unitIdArray = units.map(({ _id }) => _id);
        const lessions = await Lession.aggregate([
            { $match: { unitID: { $in: unitIdArray } } },
            {
                $lookup: {
                    from: "theories",
                    localField: "_id",
                    foreignField: "lessionID",
                    as: "theory",
                },
            },
            {
                $lookup: {
                    from: "exercises",
                    localField: "_id",
                    foreignField: "lessionID",
                    as: "exercises",
                },
            },
            {
                $lookup: {
                    from: "statisticals",
                    localField: "_id",
                    foreignField: "lessionID",
                    as: "statisticals",
                },
            },
            { $sort: { lessionNumber: 1 } },
        ]);

        res.render("subjects/content", {
            subject,
            units,
            lessions,
            success: req.flash("success"),
            errors: req.flash("error"),
        });
    }

    // [POST]/subjects/upload
    async upload(req, res) {
        try {
            if (req.file == undefined) {
                req.flash("error", "Vui lòng tải lên một tệp excel!");
                res.redirect("back");
                return;
            }
            let fileExcel = path.resolve(
                __dirname,
                "../../public/uploads/" + req.file.filename
            );

            readXlsxFile(fileExcel).then(async (rows) => {
                rows.shift();
                let subjects = [];

                rows.forEach((row) => {
                    let subject = new Subject({
                        name: row[1],
                        gradeID: row[2],
                        icon: row[3],
                    });
                    subjects.push(subject);
                });

                Subject.create(subjects)
                    .then(() => {
                        req.flash("success", "Đã tải tệp lên thành công!");
                        res.redirect("back");
                    })
                    .catch((error) => {
                        req.flash(
                            "error",
                            "Không thể nhập dữ liệu vào cơ sở dữ liệu!"
                        );
                        res.redirect("back");
                    });
            });
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = new SubjectController();
