const Subject = require("../models/Subject");
const Unit = require("../models/Unit");
const Lession = require("../models/Lession");
const RatingRegulation = require("../models/RatingRegulation");
const Result = require("../models/Result");
const User = require("../models/User");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
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
        try {
            await Lession.deleteMany({ unitID: req.params.id });
            await Unit.deleteOne({ _id: req.params.id });
            req.flash("success", "Xóa thành công!");
            res.redirect("back");
        } catch (error) {
            req.flash("error", "Xóa thất bại!");
            res.redirect("back");
        }
    }
}

module.exports = new UnitController();
