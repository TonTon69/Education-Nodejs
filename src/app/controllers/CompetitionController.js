const Rank = require("../models/Rank");
const Room = require("../models/Room");
const User = require("../models/User");
const path = require("path");
const XLSX = require("xlsx");
class CompetitionController {
    async detail(req, res) {
        const room = await Room.aggregate([
            {
                $match: {
                    roomName: req.params.id,
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
            {
                $lookup: {
                    from: "units",
                    localField: "unitID",
                    foreignField: "_id",
                    as: "unit",
                },
            },
            {
                $lookup: {
                    from: "lessions",
                    localField: "lessionID",
                    foreignField: "_id",
                    as: "lession",
                },
            },
        ]);

        // const user = await User.findOne({
        //     username: room[0].roomName.split("@").join(""),
        // });
        // const rank = await Rank.findOne({ userID: user._id });

        if (room.length > 0) {
            res.render("competition/detail", {
                room,
            });
        } else {
            res.redirect("/competition");
        }
    }

    // [GET]/competition/ranks
    async ranks(req, res) {
        let perPage = 3;
        let page = req.params.page || 1;

        const ranks = await Rank.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "userID",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $sort: { score: -1, victory: -1 } },
            { $skip: perPage * page - perPage },
            { $limit: perPage },
        ]);
        const ranksCount = await Rank.countDocuments();

        res.render("competition/ranks", {
            ranks,
            current: page,
            pages: Math.ceil(ranksCount / perPage),
        });
    }

    // [GET]/competition/ranks/:page
    async pagination(req, res) {
        let perPage = 3;
        let page = req.params.page || 1;

        const ranks = await Rank.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "userID",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $sort: { score: -1, victory: -1 } },
            { $skip: perPage * page - perPage },
            { $limit: perPage },
        ]);
        const ranksCount = await Rank.countDocuments();

        res.render("competition/ranks", {
            ranks,
            current: page,
            pages: Math.ceil(ranksCount / perPage),
        });
    }

    // [POST]/competition/ranks/export
    async export(req, res) {
        const ranks = await Rank.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "userID",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $sort: { score: -1, victory: -1 } },
        ]);

        if (ranks.length > 0) {
            let ranksExcel = [];
            ranks.forEach((item, index) => {
                let rank = {
                    STT: index + 1,
                    "Thành viên": item.user[0].fullname,
                    "Địa chỉ email": item.user[0].email,
                    "Tổng điểm tích lũy": item.score,
                    "Số trận thắng": item.victory,
                };
                ranksExcel.push(rank);
            });

            var wb = XLSX.utils.book_new();
            var temp = JSON.stringify(ranksExcel);
            temp = JSON.parse(temp);
            var ws = XLSX.utils.json_to_sheet(temp);
            let down = path.resolve(
                __dirname,
                `../../public/exports/thong-ke-bang-xep-hang-thi-dau.xlsx`
            );
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
            XLSX.writeFile(wb, down);
            res.download(down);
        } else {
            req.flash("error", "Xuất tệp không thành công. Vui lòng thử lại!");
            res.redirect("back");
        }
    }
}

module.exports = new CompetitionController();
