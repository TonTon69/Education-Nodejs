const express = require("express");
const router = express.Router();

const qaController = require("../app/controllers/QaController");
const upload = require("../utils/upload-image");

router.get("/:id/edit", qaController.edit);
router.put("/:id/edit", upload.single("thumbnail"), qaController.updateQa);
router.get("/:id/browser", qaController.browser);
router.put("/:id/browser", qaController.updateBrowser);
router.delete("/:id", qaController.delete);
router.get("/list", qaController.list);

module.exports = router;
