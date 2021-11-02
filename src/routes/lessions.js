const express = require("express");
const router = express.Router();

const lessionController = require("../app/controllers/LessionController");

// router.get("/create", lessionController.create);
router.post("/create", lessionController.postCreate);
router.delete("/:id", lessionController.delete);
router.put("/:id", lessionController.update);

module.exports = router;
