const express = require("express");
const router = express.Router();

const theoryController = require("../app/controllers/TheoryController");

router.post("/:id/export", theoryController.generatePdf);
router.get("/create", theoryController.create);
router.post("/create", theoryController.postCreate);
router.get("/detail", theoryController.detail);
router.delete("/:id", theoryController.delete);
router.put("/:id", theoryController.update);

module.exports = router;
