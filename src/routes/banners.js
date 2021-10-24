const express = require("express");
const router = express.Router();

const bannerController = require("../app/controllers/BannerController");

router.get("/create", bannerController.create);
router.post("/create", bannerController.postCreate);
router.get("/list", bannerController.list);
router.get("/:id/edit", bannerController.edit);
router.put("/:id", bannerController.update);
router.delete("/:id", bannerController.delete);

module.exports = router;
