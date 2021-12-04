const Question = require("../models/Question");

class QaController {
    // [GET]/qa/list
    async list(req, res) {
        const qaList = await Question.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "userID",
                    foreignField: "_id",
                    as: "user",
                },
            },
        ]);

        res.render("qa/list", { qaList });
    }

    // [GET]/qa/:id/edit
    async edit(req, res) {
        res.render("qa/edit");
    }
}

module.exports = new QaController();
