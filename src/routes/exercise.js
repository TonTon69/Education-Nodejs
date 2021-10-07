const express = require("express");
const router = express.Router();

const exerciseController = require("../app/controllers/ExerciseController");

// const { requireAuth } = require("../app/middlewares/AuthMiddleware");

router.get("/:slug", exerciseController.exercise);
router.post("/:slug", exerciseController.postExercise);

module.exports = router;
