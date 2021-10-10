const express = require("express");
const router = express.Router();

const learningController = require("../app/controllers/LearningController");

const { requireAuth } = require("../app/middlewares/AuthMiddleware");

router.get("/result", requireAuth, learningController.learningResult);
router.get("/:slug", requireAuth, learningController.learning);

module.exports = router;
