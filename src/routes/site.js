const express = require("express");
const router = express.Router();

const siteController = require("../app/controllers/SiteController");
const authController = require("../app/controllers/AuthController");
const {
    requireAuth,
    authValidate,
    changePassValidate,
    resetPassValidate,
} = require("../app/middlewares/AuthMiddleware");
const { search } = require("../app/middlewares/LocalMiddleware");

router.get("/password/change", authController.passwordChange);
router.put(
    "/password/change/:id",
    changePassValidate,
    authController.putPasswordChange
);

router.get("/password/reset", authController.passwordReset);
router.post("/password/reset", authController.postPasswordReset);
router.get("/reset/confirm/:token", authController.resetConfirm);
router.post(
    "/reset/confirm/:token",
    resetPassValidate,
    authController.postResetConfirm
);

router.get("/admin", siteController.admin);
router.post("/report", siteController.report);
router.get("/subjects", siteController.subjects);
router.get("/infor", requireAuth, siteController.infor);
router.get("/blog", siteController.blog);
router.get("/logout", siteController.logout);
router.get("/login", siteController.login);
router.post("/login", authValidate, siteController.postLogin);
router.post("/search", search);
router.get("/", siteController.index);

module.exports = router;
