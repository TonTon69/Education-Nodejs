const express = require("express");
const router = express.Router();

const commentController = require("../app/controllers/CommentController");
const {
    checkAdmin,
    requireAuth,
} = require("../app/middlewares/AuthMiddleware");

router.delete("/:id", commentController.delete);

module.exports = router;
