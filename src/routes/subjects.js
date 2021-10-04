const express = require("express");
const router = express.Router();

const subjectController = require("../app/controllers/SubjectController");

router.get("/:slug", subjectController.show);

module.exports = router;
