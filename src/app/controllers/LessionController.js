const mongoose = require("mongoose");
const Lession = require("../models/Lession");
const Theory = require("../models/Theory");
const Exercise = require("../models/Exercise");
const Subject = require("../models/Subject");
const Unit = require("../models/Unit");
const Statistical = require("../models/Statistical");
const Result = require("../models/Result");
const slugify = require("slugify");
const readXlsxFile = require("read-excel-file/node");
const path = require("path");
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
    async update(req, res) {
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
    async delete(req, res) {
        const statisticals = await Statistical.find({
            lessionID: req.params.id,
        });

        if (statisticals.length > 0) {
            const statisticalsIdArr = statisticals.map(({ _id }) => _id);
            await Result.deleteMany({
                statisticalID: { $in: statisticalsIdArr },
            });
            await Statistical.deleteMany({ lessionID: req.params.id });
        }

        await Theory.deleteOne({ lessionID: req.params.id });
        await Exercise.deleteMany({ lessionID: req.params.id });
        await Lession.deleteOne({ _id: req.params.id });

        req.flash("success", "Xóa thành công!");
        res.redirect("back");
    }

    // [POST]/lession/upload
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

            readXlsxFile(fileExcel).then((rows) => {
                rows.shift();
                let lessions = [];

                rows.forEach((row) => {
                    let lession = new Lession({
                        lessionNumber: row[0],
                        name: row[1],
                        unitID: req.body.unitID,
                    });
                    lessions.push(lession);
                });

                Lession.create(lessions)
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

module.exports = new LessionController();
