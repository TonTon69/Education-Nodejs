const express = require("express");
const router = express.Router();

const subjectController = require("../app/controllers/SubjectController");

router.get("/:slug", subjectController.show);
// router.get("/create", subjectController.create);
// router.post("/create", subjectController.postCreate);

module.exports = router;
