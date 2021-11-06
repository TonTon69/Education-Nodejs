const express = require("express");
const router = express.Router();

const lessionController = require("../app/controllers/LessionController");
const upload = require("../app/middlewares/upload");

router.post("/upload", upload.single("file"), lessionController.upload);
router.post("/create", lessionController.postCreate);
router.delete("/:id", lessionController.delete);
router.put("/:id", lessionController.update);

module.exports = router;
