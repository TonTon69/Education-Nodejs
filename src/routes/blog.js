const express = require("express");
const router = express.Router();

const blogController = require("../app/controllers/BlogController");

router.post("/filter", blogController.filter);
router.get("/:slug", blogController.show);

module.exports = router;
