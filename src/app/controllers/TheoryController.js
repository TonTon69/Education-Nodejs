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
    // [GET]/theories/:slug
    async detail(req, res, next) {
        const theory = await Theory.findById(req.params.slug);
        res.render("theories/detail", { theory });
    }
}

module.exports = new TheoryController();
