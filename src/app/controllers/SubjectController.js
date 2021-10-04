const Subject = require("../models/Subject");

class SubjectController {
    // [GET]/subjects/:slug
    show(req, res, next) {
        Subject.findOne({ slug: req.params.slug })
            .then(function (subject) {
                res.render("subjects/show", { subject });
            })
            .catch(next);
    }
}

module.exports = new SubjectController();
