const express = require("express");
const router = express.Router();

const exerciseController = require("../app/controllers/ExerciseController");

const { requireAuth } = require("../app/middlewares/AuthMiddleware");

router.post("/create", requireAuth, exerciseController.postCreate);
router.get("/detail", requireAuth, exerciseController.detail);
router.delete("/:id", requireAuth, exerciseController.delete);
router.put("/:id", requireAuth, exerciseController.update);

module.exports = router;
