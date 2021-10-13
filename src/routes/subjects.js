const express = require("express");
const router = express.Router();

const subjectController = require("../app/controllers/SubjectController");

router.get("/create", subjectController.create);
router.post("/create", subjectController.postCreate);
router.get("/list", subjectController.list);
router.get("/:slug", subjectController.show);
router.get("/:id/edit", subjectController.edit);
router.put("/:id", subjectController.update);
router.delete("/:id", subjectController.delete);

module.exports = router;
