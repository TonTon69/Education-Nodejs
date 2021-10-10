const express = require("express");
const router = express.Router();

const siteController = require("../app/controllers/SiteController");
const { authValidate } = require("../app/middlewares/AuthMiddleware");

router.get("/subjects", siteController.subjects);
router.get("/infor", siteController.infor);
router.get("/blog", siteController.blog);
router.get("/logout", siteController.logout);
router.get("/login", siteController.login);
router.post("/login", authValidate, siteController.postLogin);
router.get("/", siteController.index);

module.exports = router;
