const express = require("express");
const router = express.Router();

const reportController = require("../app/controllers/ReportController");

router.get("/list", reportController.list);
router.get("/list/:page", reportController.pagination);
router.post("/list", reportController.searchFilter);
router.delete("/:id", reportController.delete);
router.get("/:id/detail", reportController.detail);

// router.get("/:slug", reportController.show);

module.exports = router;
