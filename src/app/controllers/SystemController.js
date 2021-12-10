const mongoose = require("mongoose");
const System = require("../models/System");

class SystemController {
    // [GET]/systems/list
    async list(req, res) {
        const systems = await System.find({});
        res.render("systems/list", {
            systems,
            success: req.flash("success"),
            errors: req.flash("error"),
        });
    }

    //   // [GET]/systems/:id/edit
    async edit(req, res) {
        const systems = await System.findById(req.params.id);
        res.render("systems/edit", {
            systems,
            success: req.flash("success"),
        });
    }

    //   // [PUT]/systems/:id
    async update(req, res) {
        await System.updateOne({ _id: req.params.id }, req.body);
        req.flash("success", "Cập nhật thành công!");
        res.redirect("back");
    }

    //   // [DELETE]/systems/:id
    async delete(req, res) {
        try {
            await System.deleteOne({ _id: req.params.id });
            req.flash("success", "Xóa thành công!");
            res.redirect("back");
        } catch (error) {
            req.flash("error", "Xóa thất bại!");
            res.redirect("back");
        }
    }
}

module.exports = new SystemController();
