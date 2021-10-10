const express = require("express");
const router = express.Router();

const inforController = require("../app/controllers/InforController");

router.put("/:id", inforController.update);

module.exports = router;
