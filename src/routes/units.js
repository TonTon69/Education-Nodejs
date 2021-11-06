const express = require("express");
const router = express.Router();

const unitController = require("../app/controllers/UnitController");
const upload = require("../app/middlewares/upload");

router.post("/upload", upload.single("file"), unitController.upload);
router.get("/create", unitController.create);
router.post("/create", unitController.postCreate);
router.get("/list", unitController.list);
router.get("/list/:page", unitController.pagination);
router.post("/list", unitController.searchFilter);
router.get("/:id/edit", unitController.edit);
router.put("/:id", unitController.update);
router.delete("/:id", unitController.delete);

module.exports = router;
