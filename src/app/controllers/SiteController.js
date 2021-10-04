class SiteController {
    // [GET]/
    index(req, res, next) {
        res.render("index");
    }
}

module.exports = new SiteController();
