class SiteController {
    // [GET]/
    index(req, res, next) {
        res.render("index");
    }

    // [GET]/subjects
    subjects(req, res, next) {
        res.render("subjects");
    }
}

module.exports = new SiteController();
