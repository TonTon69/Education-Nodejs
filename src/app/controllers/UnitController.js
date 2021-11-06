const Subject = require("../models/Subject");
const Unit = require("../models/Unit");
const Lession = require("../models/Lession");
const Theory = require("../models/Theory");
const Result = require("../models/Result");
const User = require("../models/User");
const Exercise = require("../models/Exercise");
const Statistical = require("../models/Statistical");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const readXlsxFile = require("read-excel-file/node");
const path = require("path");
class UnitController {
    // [GET]/units/list
    async list(req, res) {
        let perPage = 3;
        let page = req.params.page || 1;
        const units = await Unit.aggregate([
            {
                $lookup: {
                    from: "subjects",
                    localField: "subjectID",
                    foreignField: "_id",
                    as: "subject",
                },
            },
            {
                $skip: perPage * page - perPage,
            },
            {
                $limit: perPage,
            },
        ]);
        const unitSubjectIdArr = units.map(({ subjectID }) => subjectID);
        const subjects = await Subject.find({ _id: { $in: unitSubjectIdArr } });

        const unitsCount = await Unit.countDocuments();
        res.render("units/list", {
            units,
            current: page,
            pages: Math.ceil(unitsCount / perPage),
            success: req.flash("success"),
            errors: req.flash("error"),
            subjects,
        });
    }

    // [GET]/units/list/:page
    async pagination(req, res) {
        let perPage = 3;
        let page = req.params.page || 1;
        const units = await Unit.aggregate([
            {
                $lookup: {
                    from: "subjects",
                    localField: "subjectID",
                    foreignField: "_id",
                    as: "subject",
                },
            },
            {
                $skip: perPage * page - perPage,
            },
            {
                $limit: perPage,
            },
        ]);
        const unitSubjectIdArr = units.map(({ subjectID }) => subjectID);
        const subjects = await Subject.find({
            _id: { $in: unitSubjectIdArr },
        });
        const unitsCount = await Unit.countDocuments();
        res.render("units/list", {
            units,
            current: page,
            pages: Math.ceil(unitsCount / perPage),
            success: req.flash("success"),
            errors: req.flash("error"),
            subjects,
        });
    }

    // [POST]/units/list
    async searchFilter(req, res) {
        try {
            const searchString = req.body.query;
            const option = req.body.option;
            let units = [];
            if (searchString) {
                units = await Unit.aggregate([
                    {
                        $match: {
                            name: { $regex: searchString, $options: "$i" },
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
                ]);
            } else if (option) {
                units = await Unit.aggregate([
                    {
                        $match: { subjectID: ObjectId(option) },
                    },
                    {
                        $lookup: {
                            from: "subjects",
                            localField: "subjectID",
                            foreignField: "_id",
                            as: "subject",
                        },
                    },
                ]);
            } else {
                units = await Unit.aggregate([
                    {
                        $lookup: {
                            from: "subjects",
                            localField: "subjectID",
                            foreignField: "_id",
                            as: "subject",
                        },
                    },
                ]);
            }
            res.render("helper/table", { units });
        } catch (error) {
            console.log(error);
            req.flash("error", "Không tìm thấy kết quả!");
        }
    }

    // [GET]/units/create
    async create(req, res) {
        const subjects = await Subject.find({});

        res.render("units/create", {
            subjects,
            success: req.flash("success"),
            errors: req.flash("error"),
        });
    }

    // [POST]/units/create
    async postCreate(req, res) {
        const { name, subjectID } = req.body;
        const findUnit = await Unit.findOne({
            name: name,
            subjectID: subjectID,
        });
        if (findUnit) {
            req.flash(
                "error",
                "Chuyên đề này đã tồn tại... Vui lòng nhập chuyên đề khác!"
            );
            res.redirect("back");
            return;
        }
        const unit = new Unit(req.body);
        await unit.save();
        req.flash("success", "Thêm mới thành công!");
        res.redirect("back");
    }

    // [GET]/units/:id/edit
    async edit(req, res, next) {
        const subjects = await Subject.find({});
        const unit = await Unit.findById(req.params.id);
        res.render("units/edit", {
            subjects,
            unit,
            success: req.flash("success"),
            errors: req.flash("error"),
        });
    }

    // [PUT]/units/:id
    async update(req, res, next) {
        const { name, subjectID } = req.body;
        const findUnit = await Unit.findOne({
            name: name,
            subjectID: subjectID,
        });
        if (findUnit) {
            req.flash(
                "error",
                "Chuyên đề này đã tồn tại... Vui lòng nhập chuyên đề khác!"
            );
            res.redirect("back");
            return;
        }
        await Unit.updateOne({ _id: req.params.id }, req.body);
        req.flash("success", "Cập nhật thành công!");
        res.redirect("back");
    }

    // [DELETE]/units/:id
    async delete(req, res, next) {
        const lessions = await Lession.find({ unitID: req.params.id });
        if (lessions.length > 0) {
            const lessionsIdArr = lessions.map(({ _id }) => _id);
            await Theory.deleteMany({
                lessionID: { $in: lessionsIdArr },
            });
            await Exercise.deleteMany({
                lessionID: { $in: lessionsIdArr },
            });
            await Lession.deleteMany({ unitID: req.params.id });

            const statisticals = await Statistical.find({
                lessionID: { $in: lessionsIdArr },
            });

            if (statisticals.length > 0) {
                const statisticalsIdArr = statisticals.map(({ _id }) => _id);
                await Result.deleteMany({
                    statisticalID: { $in: statisticalsIdArr },
                });
                await Statistical.deleteMany({
                    lessionID: { $in: lessionsIdArr },
                });
            }
        }

        await Unit.deleteOne({ _id: req.params.id });
        req.flash("success", "Xóa thành công!");
        res.redirect("back");
    }

    // [POST]/units/upload
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
                let units = [];

                rows.forEach((row) => {
                    let unit = new Unit({
                        name: `CHƯƠNG ${row[0]}. ${row[1]
                            .toString()
                            .toUpperCase()}`,
                        subjectID: req.body.subjectID,
                    });
                    units.push(unit);
                });

                Unit.create(units)
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

module.exports = new UnitController();
