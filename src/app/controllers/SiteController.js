const Subject = require("../models/Subject");
const Grade = require("../models/Grade");

class SiteController {
    // [GET]/
    index(req, res, next) {
        res.render("index");
    }

    // [GET]/subjects
    subjects(req, res, next) {
        Promise.all([Subject.find({}), Grade.find({})])
            .then(([subjects, grades]) => {
                res.render("subjects", { subjects, grades });
            })
            .catch(next);
    }
}

module.exports = new SiteController();
