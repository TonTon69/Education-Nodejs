const express = require("express");
const router = express.Router();

const subjectController = require("../app/controllers/SubjectController");

router.get("/create", subjectController.create);
router.post("/create", subjectController.postCreate);
router.get("/list", subjectController.list);
router.get("/list/:page", subjectController.pagination);
router.post("/list", subjectController.searchFilter);
router.get("/:id/edit", subjectController.edit);
router.put("/:id", subjectController.update);
router.delete("/:id", subjectController.delete);
router.get("/:slug", subjectController.show);

module.exports = router;
