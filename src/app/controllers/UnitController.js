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
        const unitsCount = await Unit.countDocuments();
        res.render("units/list", {
            units,
            current: page,
            pages: Math.ceil(unitsCount / perPage),
            success: req.flash("success"),
            errors: req.flash("error"),
        });
    }

    // // [GET]/subjects/list/:page
    // async pagination(req, res) {
    //     let perPage = 3;
    //     let page = req.params.page || 1;
    //     const subjects = await Subject.find({})
    //         .sort({ gradeID: -1 })
    //         .skip(perPage * page - perPage)
    //         .limit(perPage);
    //     const subjectsCount = await Subject.countDocuments();
    //     res.render("subjects/list", {
    //         subjects,
    //         current: page,
    //         pages: Math.ceil(subjectsCount / perPage),
    //         success: req.flash("success"),
    //         errors: req.flash("error"),
    //     });
    // }

    // // [POST]/subjects/list
    // async searchFilter(req, res) {
    //     try {
    //         const searchString = req.body.query;
    //         const option = req.body.option;
    //         let subjects = [];
    //         if (searchString) {
    //             subjects = await Subject.find({
    //                 name: { $regex: searchString, $options: "$i" },
    //             }).sort({ gradeID: -1 });
    //         } else if (option) {
    //             subjects = await Subject.find({ gradeID: option });
    //         } else {
    //             subjects = await Subject.find({}).sort({ gradeID: -1 });
    //         }
    //         res.render("helper/table", { subjects });
    //     } catch (error) {
    //         console.log(error);
    //         req.flash("error", "Không tìm thấy kết quả!");
    //     }
    // }

    // // [GET]/subjects/create
    // async create(req, res) {
    //     res.render("subjects/create", {
    //         success: req.flash("success"),
    //     });
    // }

    // // [POST]/subjects/create
    // async postCreate(req, res) {
    //     const subject = new Subject(req.body);
    //     await subject.save();
    //     req.flash("success", "Thêm mới thành công!");
    //     res.redirect("back");
    // }

    // // [GET]/subjects/:id/edit
    // async edit(req, res, next) {
    //     const subject = await Subject.findById(req.params.id);
    //     res.render("subjects/edit", {
    //         subject,
    //         success: req.flash("success"),
    //     });
    // }

    // // [PUT]/subjects/:id
    // async update(req, res, next) {
    //     await Subject.updateOne({ _id: req.params.id }, req.body);
    //     req.flash("success", "Cập nhật thành công!");
    //     res.redirect("back");
    // }

    // // [DELETE]/subjects/:id
    // async delete(req, res, next) {
    //     try {
    //         await Subject.deleteOne({ _id: req.params.id });
    //         req.flash("success", "Xóa thành công!");
    //         res.redirect("back");
    //     } catch (error) {
    //         req.flash("error", "Xóa thất bại!");
    //         res.redirect("back");
    //     }
    // }
}

module.exports = new UnitController();
