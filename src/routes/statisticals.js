const express = require("express");
const router = express.Router();

const statisticalController = require("../app/controllers/StatisticalController");

const { requireAuth } = require("../app/middlewares/AuthMiddleware");

router.get("/:id/detail", requireAuth, statisticalController.detail);
router.delete("/:id", requireAuth, statisticalController.delete);
router.get("/", requireAuth, statisticalController.show);

module.exports = router;
