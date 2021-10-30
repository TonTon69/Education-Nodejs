const mongoose = require("mongoose");
const Lession = require("../models/Lession");
const Subject = require("../models/Subject");
const Unit = require("../models/Unit");

class LessionController {
    // // [GET]/banners/list
    // async list(req, res) {
    //     const banners = await Banner.find({});
    //     res.render("banners/list", {
    //         banners,
    //         success: req.flash("success"),
    //         errors: req.flash("error"),
    //     });
    // }

    // // [GET]/banners/create
    // async create(req, res) {
    //     res.render("banners/create", {
    //         success: req.flash("success"),
    //     });
    // }

    // [POST]/banners/create
    async postCreate(req, res) {
        const lession = new Lession(req.body);
        await lession.save();
        req.flash("success", "Thêm mới bài học thành công!");
        res.redirect("back");
    }

    // //   // [GET]/banners/:id/edit
    // async edit(req, res, next) {
    //     const banner = await Banner.findById(req.params.id);
    //     res.render("banners/edit", {
    //         banner,
    //         success: req.flash("success"),
    //     });
    // }

    // //   // [PUT]/banners/:id
    // async update(req, res, next) {
    //     await Banner.updateOne({ _id: req.params.id }, req.body);
    //     req.flash("success", "Cập nhật thành công!");
    //     res.redirect("back");
    // }

    // //   // [DELETE]/banners/:id
    // async delete(req, res, next) {
    //     try {
    //         await Banner.deleteOne({ _id: req.params.id });
    //         req.flash("success", "Xóa thành công!");
    //         res.redirect("back");
    //     } catch (error) {
    //         req.flash("error", "Xóa thất bại!");
    //         res.redirect("back");
    //     }
    // }
}

module.exports = new LessionController();
