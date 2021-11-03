const express = require("express");
const router = express.Router();

const systemController = require("../app/controllers/SystemController");

router.get("/list", systemController.list);
router.get("/:id/edit", systemController.edit);
router.put("/:id", systemController.update);

module.exports = router;
