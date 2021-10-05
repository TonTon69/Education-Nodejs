const express = require("express");
const router = express.Router();

const subjectController = require("../app/controllers/SubjectController");

const { requireAuth } = require("../app/middlewares/AuthMiddleware");

router.get("/:slug", subjectController.learning);

module.exports = router;
