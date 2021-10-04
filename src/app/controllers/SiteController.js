class SiteController {
    // [GET]/
    index(req, res, next) {
        res.send("Hello");
    }
}

module.exports = new SiteController();
