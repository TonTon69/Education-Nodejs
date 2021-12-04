const express = require("express");
const router = express.Router();

const qaController = require("../app/controllers/QaController");

router.get("/:id/edit", qaController.edit);
router.get("/list", qaController.list);

module.exports = router;
