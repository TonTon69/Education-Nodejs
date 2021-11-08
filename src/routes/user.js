const express = require("express");
const router = express.Router();

const userController = require("../app/controllers/UserController");

// router.get("/create-list-user", userController.createListUser);
router.post("/create-list-user", userController.addUserList);
router.get("/list-user", userController.listUser);
router.get("/list-role", userController.listRole);
router.get("/create", userController.create);
router.post("/create", userController.createUser);
router.get("/:id/update", userController.update);
router.put("/:id/update", userController.putUpdate);
router.delete("/:id/delete", userController.deleteUser);
router.post("/list-user", userController.searchFilter);
router.post("/add-role", userController.addRole);

module.exports = router;
