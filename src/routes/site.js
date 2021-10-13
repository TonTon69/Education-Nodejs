const express = require("express");
const router = express.Router();

const siteController = require("../app/controllers/SiteController");
const {
    requireAuth,
    authValidate,
} = require("../app/middlewares/AuthMiddleware");

router.get("/password/reset", siteController.passwordReset);
router.get("/admin", siteController.admin);
router.post("/report", siteController.report);
router.get("/subjects", siteController.subjects);
router.get("/infor", requireAuth, siteController.infor);
router.get("/blog", siteController.blog);
router.get("/logout", siteController.logout);
router.get("/login", siteController.login);
router.post("/login", authValidate, siteController.postLogin);
router.get("/", siteController.index);

module.exports = router;
