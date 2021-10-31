const express = require("express");
const router = express.Router();

const theoryController = require("../app/controllers/TheoryController");

router.get("/detail", theoryController.detail);
router.put("/:id", theoryController.update);

module.exports = router;
