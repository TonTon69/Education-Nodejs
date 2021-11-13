const Room = require("../models/Room");
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
        if (room.length > 0) {
            res.render("competition/detail", { room });
        } else {
            res.redirect("/competition");
        }
    }
}

module.exports = new CompetitionController();
