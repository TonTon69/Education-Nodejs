const mongoose = require("mongoose");
const Lession = require("../models/Lession");
const Theory = require("../models/Theory");
const Exercise = require("../models/Exercise");
const Subject = require("../models/Subject");
const Unit = require("../models/Unit");
const slugify = require("slugify");
class LessionController {
    // [POST]/banners/create
    async postCreate(req, res) {
        const { name } = req.body;
        const findLession = await Lession.findOne({ name });
        if (findLession) {
            req.flash(
                "error",
                "Bài học này đã tồn tại... Vui lòng nhập học này khác!"
            );
            res.redirect("back");
            return;
        }
        const lession = new Lession(req.body);
        await lession.save();
        req.flash("success", "Thêm mới bài học thành công!");
        res.redirect("back");
    }

    //   // [PUT]/lessions/:id
    async update(req, res, next) {
        const { name, lessionNumber, unitID } = req.body;
        const findLession = await Lession.findOne({ name: name });
        if (findLession) {
            req.flash(
                "error",
                "Bài học này đã tồn tại... Vui lòng nhập học này khác!"
            );
            res.redirect("back");
            return;
        }
        await Lession.updateOne(
            { _id: req.params.id },
            {
                name,
                lessionNumber,
                unitID,
                slug: slugify(name.toLowerCase()),
            }
        );
        req.flash("success", "Cập nhật thành công!");
        res.redirect("back");
    }

    // [DELETE]/lessions/:id
    async delete(req, res, next) {
        await Theory.deleteOne({ lessionID: req.params.id });
        await Exercise.deleteMany({ lessionID: req.params.id });
        await Lession.deleteOne({ _id: req.params.id });
        req.flash("success", "Xóa thành công!");
        res.redirect("back");
    }
}

module.exports = new LessionController();
