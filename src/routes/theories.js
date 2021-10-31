const express = require("express");
const router = express.Router();

const theoryController = require("../app/controllers/TheoryController");

router.get("/detail", theoryController.detail);

module.exports = router;
