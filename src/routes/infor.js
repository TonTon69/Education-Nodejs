const express = require("express");
const router = express.Router();

const inforController = require("../app/controllers/InforController");

const { requireAuth } = require("../app/middlewares/AuthMiddleware");

router.put("/:id", requireAuth, inforController.update);
router.put("/:id/avatar", requireAuth, inforController.changeAvatar);

module.exports = router;
