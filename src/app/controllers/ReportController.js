const Report = require("../models/Report");
const User = require("../models/User");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

class ReportController {
    // // [GET]/:id/detail
    async detail(req, res, next) {
        try {
            const report = await Report.aggregate([
                {
                    $match: {
                        _id: ObjectId(req.params.id),
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userID",
                        foreignField: "_id",
                        as: "User",
                    },
                },
            ]);
            res.render("reports/detail", {
                report,
            });
        } catch (error) {
            res.render("error");
        }
    }

    // [GET]/reports/list
    async list(req, res) {
        let perPage = 3;
        let page = req.params.page || 1;

        const reports = await Report.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "userID",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $skip: perPage * page - perPage },
            { $limit: perPage },
        ]);

        const reportsCount = await Report.countDocuments();
        res.render("reports/list", {
            reports,
            current: page,
            pages: Math.ceil(reportsCount / perPage),
            success: req.flash("success"),
            errors: req.flash("error"),
        });
    }

    // [GET]/reports/list/:page
    async pagination(req, res) {
        let perPage = 3;
        let page = req.params.page || 1;
        const reports = await Report.find({})
            .skip(perPage * page - perPage)
            .limit(perPage);
        const reportsCount = await Report.countDocuments();
        res.render("reports/list", {
            reports,
            current: page,
            pages: Math.ceil(reportsCount / perPage),
            success: req.flash("success"),
            errors: req.flash("error"),
        });
    }

    // [POST]/reports/list
    async searchFilter(req, res) {
        try {
            const searchString = req.body.query;
            const option = req.body.option;
            let reports = [];
            if (searchString) {
                reports = await Report.find({
                    content: { $regex: searchString, $options: "$i" },
                });
            } else if (option) {
                reports = await Report.find({ content: option });
            } else {
                reports = await Report.find({});
            }
            res.render("helper/table-report", { reports });
        } catch (error) {
            console.log(error);
            req.flash("error", "Không tìm thấy kết quả!");
        }
    }

    // [DELETE]/reports/:id
    async delete(req, res, next) {
        await Report.deleteOne({ _id: req.params.id });
        req.flash("success", "Xóa thành công!");
        res.redirect("back");
    }
}

module.exports = new ReportController();
