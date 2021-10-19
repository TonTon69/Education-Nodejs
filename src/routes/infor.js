const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

const inforController = require("../app/controllers/InforController");
const { requireAuth } = require("../app/middlewares/AuthMiddleware");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(__dirname, "../public/uploads/"));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage: storage });

router.put(
    "/:id/avatar",
    requireAuth,
    upload.single("avatar"),
    inforController.changeAvatar
);
router.put("/:id", requireAuth, inforController.update);

module.exports = router;
