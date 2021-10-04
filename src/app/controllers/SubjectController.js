class SubjectController {
    // [GET]/subjects/:slug
    show(req, res, next) {
        res.render("show");
    }
}

module.exports = new SubjectController();
