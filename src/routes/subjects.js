const express = require("express");
const router = express.Router();

const subjectController = require("../app/controllers/SubjectController");
const upload = require("../app/middlewares/upload");

router.post("/upload", upload.single("file"), subjectController.upload);
router.get("/create", subjectController.create);
router.post("/create", subjectController.postCreate);
router.get("/list", subjectController.list);
router.get("/list/:page", subjectController.pagination);
router.post("/list", subjectController.searchFilter);
router.get("/:id/edit", subjectController.edit);
router.get("/:id/content", subjectController.content);
router.put("/:id", subjectController.update);
router.delete("/:id", subjectController.delete);
router.get("/:slug", subjectController.show);

module.exports = router;
