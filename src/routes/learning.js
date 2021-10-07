const express = require("express");
const router = express.Router();

const learningController = require("../app/controllers/LearningController");

const { requireAuth } = require("../app/middlewares/AuthMiddleware");

router.get("/:slug", learningController.learning);

module.exports = router;
