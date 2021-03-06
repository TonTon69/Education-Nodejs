const express = require("express");
const router = express.Router();

const siteController = require("../app/controllers/SiteController");
const authController = require("../app/controllers/AuthController");
const qaController = require("../app/controllers/QaController");
const upload = require("../utils/upload-image");
const {
    requireAuth,
    checkAdmin,
    authValidate,
    changePassValidate,
    resetPassValidate,
} = require("../app/middlewares/AuthMiddleware");
const { search } = require("../app/middlewares/LocalMiddleware");

router.post("/notif/mark-all-read", requireAuth, qaController.postMarkAllRead);
router.get("/password/change", requireAuth, authController.passwordChange);
router.put(
    "/password/change/:id",
    requireAuth,
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

router.get("/admin", requireAuth, checkAdmin, siteController.admin);
router.post("/report", requireAuth, siteController.report);
router.get("/subjects", siteController.subjects);
router.get("/infor", requireAuth, siteController.infor);
router.get("/blog", siteController.blog);
router.get("/my-qa", requireAuth, siteController.storedQa);
router.get("/new-question", requireAuth, siteController.newQuestion);
router.post(
    "/new-question",
    requireAuth,
    upload.single("thumbnail"),
    siteController.postNewQuestion
);
router.get("/qa", siteController.qa);
router.get("/logout", requireAuth, siteController.logout);
router.get("/login", siteController.login);
router.post("/login", authValidate, siteController.postLogin);
router.post("/search", search);
router.get("/about", siteController.about);
router.get("/competition", requireAuth, siteController.competition);
router.get("/", siteController.index);

module.exports = router;
