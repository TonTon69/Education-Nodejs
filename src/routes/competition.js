const express = require("express");
const router = express.Router();

const competitionController = require("../app/controllers/CompetitionController");

router.get("/:id", competitionController.detail);

module.exports = router;
