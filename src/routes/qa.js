const express = require("express");
const router = express.Router();

const qaController = require("../app/controllers/QaController");

router.get("/:id/edit", qaController.edit);
router.put("/:id", qaController.update);
router.delete("/:id", qaController.delete);
router.get("/list", qaController.list);

module.exports = router;
