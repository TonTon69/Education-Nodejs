const express = require("express");
const router = express.Router();
const {
    checkAdmin,
    requireAuth,
} = require("../app/middlewares/AuthMiddleware");
const theoryController = require("../app/controllers/TheoryController");

router.post("/:id/export", requireAuth, theoryController.generatePdf);
router.get("/create", requireAuth, checkAdmin, theoryController.create);
router.post("/create", requireAuth, checkAdmin, theoryController.postCreate);
router.get("/detail", requireAuth, checkAdmin, theoryController.detail);
router.delete("/:id", requireAuth, checkAdmin, theoryController.delete);
router.put("/:id", requireAuth, checkAdmin, theoryController.update);

module.exports = router;
