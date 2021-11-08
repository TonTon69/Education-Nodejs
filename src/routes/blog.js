const express = require("express");
const router = express.Router();

const blogController = require("../app/controllers/BlogController");
const {
    checkAdmin,
    requireAuth,
} = require("../app/middlewares/AuthMiddleware");

router.get("/list-blog", blogController.listBlog);
router.get("/list-category", blogController.listCategory);
router.get("/create", blogController.create);
router.post("/post", blogController.postBlog);
router.post("/list-blog", blogController.searchFilter);
router.get("/:id/update", blogController.update);
router.put("/:id/update", blogController.putUpdate);
router.delete("/:id/delete", blogController.deleteBlog);
router.delete("/:id/delete-category", blogController.deleteCategory);
router.post("/add-category", blogController.addCategory);
router.post("/filter", blogController.filter);
router.get("/:slug", blogController.show);

module.exports = router;
