class CompetitionController {
    async detail(req, res) {
        res.render("competition/detail");
    }
}

module.exports = new CompetitionController();
