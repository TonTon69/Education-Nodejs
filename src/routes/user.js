const express = require("express");
const router = express.Router();

const userController = require("../app/controllers/UserController");
const upload = require("../app/middlewares/upload");

router.post("/export", userController.export);
router.post("/upload", upload.single("filename"), userController.addUserList);
router.get("/list", userController.listUser);
router.get("/list-role", userController.listRole);
router.get("/create", userController.create);
router.post("/create", userController.createUser);
router.get("/:id/update", userController.update);
router.put("/:id/update", userController.putUpdate);
router.delete("/:id/delete", userController.deleteUser);
router.post("/list", userController.searchFilter);

module.exports = router;
