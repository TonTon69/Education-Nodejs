const express = require("express");
const router = express.Router();

const learningController = require("../app/controllers/LearningController");

const { requireAuth } = require("../app/middlewares/AuthMiddleware");

router.get("/:slug", learningController.learning);
router.get("/result", learningController.learningResult);

module.exports = router;
