const Subject = require("../models/Subject");
const Unit = require("../models/Unit");
const Lession = require("../models/Lession");
const Theory = require("../models/Theory");
const Exercise = require("../models/Exercise");
const User = require("../models/User");
const Result = require("../models/Result");
const Statistical = require("../models/Statistical");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
class TheoryController {
    // [GET]/theories?lession
    async detail(req, res, next) {
        try {
            if (ObjectId.isValid(req.query.lession)) {
                const theory = await Theory.aggregate([
                    { $match: { lessionID: ObjectId(req.query.lession) } },
                    {
                        $lookup: {
                            from: "lessions",
                            localField: "lessionID",
                            foreignField: "_id",
                            as: "lession",
                        },
                    },
                    {
                        $unwind: "$lession",
                    },
                    {
                        $lookup: {
                            from: "units",
                            localField: "lession.unitID",
                            foreignField: "_id",
                            as: "lession.unit",
                        },
                    },
                    {
                        $unwind: "$lession.unit",
                    },
                    {
                        $lookup: {
                            from: "subjects",
                            localField: "lession.unit.subjectID",
                            foreignField: "_id",
                            as: "lession.unit.subject",
                        },
                    },
                ]);
                res.render("theories/detail", {
                    theory,
                    success: req.flash("success"),
                    errors: req.flash("error"),
                });
            } else {
                res.render("error");
            }
        } catch (error) {
            console.log(error);
        }
    }

    // [PUT]/theories/:id
    async update(req, res, next) {
        await Theory.updateOne({ _id: req.params.id }, req.body);
        req.flash("success", "Cập nhật thành công!");
        res.redirect("back");
    }
}

module.exports = new TheoryController();
