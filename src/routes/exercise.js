const express = require("express");
const router = express.Router();

const exerciseController = require("../app/controllers/ExerciseController");

const { requireAuth } = require("../app/middlewares/AuthMiddleware");

router.get("/:slug", requireAuth, exerciseController.exercise);
router.post("/:slug", requireAuth, exerciseController.postExercise);

module.exports = router;
