const express = require("express");
const router = express.Router();

const exerciseController = require("../app/controllers/ExerciseController");

const { requireAuth } = require("../app/middlewares/AuthMiddleware");

router.get("/detail", requireAuth, exerciseController.detail);
router.put("/:id", requireAuth, exerciseController.update);

module.exports = router;
