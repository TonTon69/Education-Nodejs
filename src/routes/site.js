const express = require("express");
const router = express.Router();

const siteController = require("../app/controllers/SiteController");
const { authValidate } = require("../app/middlewares/AuthMiddleware");

router.get("/", siteController.index);
router.get("/subjects", siteController.subjects);
router.get("/login", siteController.login);
router.post("/login", authValidate, siteController.postLogin);

module.exports = router;
