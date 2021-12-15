const express = require("express");
const router = express.Router();

const qaController = require("../app/controllers/QaController");
const upload = require("../utils/upload-image");
const {
    checkAdmin,
    requireAuth,
} = require("../app/middlewares/AuthMiddleware");

router.get("/:id/detail", requireAuth, checkAdmin, qaController.detail);
router.get("/:id/edit", requireAuth, qaController.edit);
router.put(
    "/:id/edit",
    requireAuth,
    upload.single("thumbnail"),
    qaController.updateQa
);
router.get("/:id/browser", requireAuth, checkAdmin, qaController.browser);
router.put("/:id/browser", requireAuth, checkAdmin, qaController.updateBrowser);
router.delete("/:id/delete", requireAuth, qaController.delete);
router.delete("/:id/destroy", requireAuth, checkAdmin, qaController.destroy);
router.get("/list", requireAuth, checkAdmin, qaController.list);
router.get("/:slug", qaController.show);

module.exports = router;
