const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const User = require("../models/User");
const Role = require("../models/Role");
const Grade = require("../models/Grade");

class UserController {
    async listUser(req, res, next) {
        try {
            const roles = await Role.find({});
            const users = await User.aggregate([
                {
                    $lookup: {
                        from: "roles", // table database liên kết
                        localField: "roleID", // thuộc tính của object
                        foreignField: "_id", // thuộc tính được liên kết
                        as: "Role",
                    },
                },
            ]);

            res.render("user/list-user", {
                roles,
                users,
                success: req.flash("success"),
                errors: req.flash("error"),
            });
        } catch (err) {
            res.render("error");
        }
    }
    async create(req, res, next) {
        const roles = await Role.find({});
        const grades = await Grade.find({});
        res.render("user/create", {
            roles,
            grades,
            success: req.flash("success"),
            errors: req.flash("error"),
        });
    }
    async createUser(req, res, next) {
        try {
            const formUser = req.body;
            formUser.fullname = formUser.firstName + " " + formUser.lastName;
            formUser.active = true;
            formUser.avatar =
                "https://fullstack.edu.vn/assets/images/nobody_m.256x256.jpg";
            console.log(formUser);
            if (formUser.password == formUser.confirmPassword) {
                console.log("đã khớp mật khẩu");
                console.log(formUser);
                const user = new User(formUser);
                console.log(user);
                user.save()
                    .then(() => {
                        res.flash(
                            "success",
                            "đăng ký thành công tài khoản mới"
                        );
                        res.redirect("/user/list-user");
                    })
                    .catch((error) => {});
                console.log("đã lưu");
            } else {
                console.log("không khớp mật khẩu");
                res.flash("error", "mật khẩu không khớp!");
                res.redirect("/user/create");
                return;
            }
        } catch (err) {}
    }
    // [POST]/blog/list-blog
    async searchFilter(req, res) {
        try {
            const searchString = req.body.query;
            const option = req.body.option;
            const roles = await Role.find({});
            let users = [];
            if (searchString) {
                users = await User.find({
                    fullname: { $regex: searchString, $options: "$i" },
                });
            } else if (option) {
                users = await User.find({ roleID: option });
            } else {
                users = await User.find({}).sort({ roleID: -1 });
            }
            console.log(roles);
            res.render("helper/table-user", { users, roles });
        } catch (error) {
            console.log(error);
            req.flash("error", "Không tìm thấy kết quả!");
        }
    }
    async addRole(req, res, next) {
        const formDate = req.body;
        const role = new Role(formDate);
        role.save()
            .then(() => {
                req.flash("success", "đã thêm 1 thể loại!");
                res.redirect("back");
            })
            .catch((error) => {});
    }

    async listRole(req, res, next) {
        const roles = await Role.find({});
        res.render("user/list-role", {
            roles,
        });
    }

    async update(req, res, next) {
        var user = await User.findOne({ _id: req.params.id });
        const roles = await Role.find({});
        res.render("user/update", {
            user,
            roles,
        });
    }

    async putUpdate(req, res, next) {
        User.updateOne({ _id: req.params.id }, req.body)
            .then(() => {
                res.redirect("/user/list-user");
            })
            .catch(next);
    }

    async deleteUser(req, res, next) {
        User.deleteOne({ _id: req.params.id })
            .then(() => {
                res.redirect("back");
            })
            .catch(next);
    }
}

module.exports = new UserController();
