const express = require("express");
const router = express.Router();

const exerciseController = require("../app/controllers/ExerciseController");

const {
    requireAuth,
    checkAdmin,
} = require("../app/middlewares/AuthMiddleware");
const upload = require("../app/middlewares/upload");

router.post("/:id/export", requireAuth, checkAdmin, exerciseController.export);
router.post(
    "/upload",
    requireAuth,
    checkAdmin,
    upload.single("file"),
    exerciseController.upload
);
router.get("/create", requireAuth, checkAdmin, exerciseController.create);
router.post("/create", requireAuth, checkAdmin, exerciseController.postCreate);
router.get("/detail", requireAuth, checkAdmin, exerciseController.detail);
router.delete("/:id", requireAuth, checkAdmin, exerciseController.delete);
router.put("/:id", requireAuth, checkAdmin, exerciseController.update);

module.exports = router;
