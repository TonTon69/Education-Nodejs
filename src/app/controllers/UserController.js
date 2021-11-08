const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const User = require("../models/User");
const Role = require("../models/Role");
const Grade = require("../models/Grade");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const importExcel = require("convert-excel-to-json");
const isJson = require("is-json");
const json2xls = require("json2xls");
const fs = require("fs");
const path = require("path");

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
        const formUser = req.body;
        formUser.fullname = formUser.firstName + " " + formUser.lastName;
        formUser.active = true;
        formUser.avatar = path.resolve(
            __dirname,
            "../../public/img/nobody.jpg"
        );

        if (formUser.password == formUser.confirmPassword) {
            formUser.password = await bcrypt.hash(formUser.password, 10);
            const user = new User(formUser);
            await user.save();
            res.flash("success", "Đăng ký thành công tài khoản mới!");
            res.redirect("/user/list-user");
        } else {
            res.flash("error", "Mật khẩu nhập lại không khớp!");
            res.redirect("/user/create");
            return;
        }
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
                users = await User.find({});
            }
            res.render("helper/table-user", { users, roles });
        } catch (error) {
            req.flash("error", "Không tìm thấy kết quả!");
        }
    }

    // [POST] user/add-role
    async addRole(req, res, next) {
        const formDate = req.body;
        const role = new Role(formDate);
        role.save()
            .then(() => {
                req.flash("success", "Đã thêm thành công 1 chức vụ!");
                res.redirect("back");
            })
            .catch((error) => {});
    }

    async listRole(req, res, next) {
        const roles = await Role.find({});
        res.render("user/list-role", {
            success: req.flash("success"),
            errors: req.flash("error"),
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
                req.flash("success", "Đã cập nhật thành công!");
                res.redirect("/user/list-user");
            })
            .catch(next);
    }

    async deleteUser(req, res, next) {
        User.deleteOne({ _id: req.params.id })
            .then(() => {
                req.flash("success", "Đã xóa thành công!");
                res.redirect("back");
            })
            .catch(next);
    }

    //[POST] user/create-list-user
    async addUserList(req, res, next) {
        let userCheck = await User.find({});
        const file = req.files.filename;
        const fileName = file.name;
        let usersInvalid = [];
        let pathExcel = path.join(
            __dirname,
            "../../public/excelimport/" + fileName
        );
        console.log(pathExcel);
        file.mv(pathExcel, (err) => {
            if (err) {
                return res.status(500).send(err);
            } else {
                const result = importExcel({
                    sourceFile: pathExcel,
                    header: {
                        rows: 1,
                    },
                    columnToKey: {
                        A: "fullname",
                        B: "birthDay",
                        C: "phone",
                        D: "address",
                        E: "email",
                    },
                });
                let users = result.Sheet1;
                let usersValid = [];
                let usersInvalid = [];
                for (var i = 0; i < users.length; i++) {
                    let flag = 0;
                    for (var j = 0; j < userCheck.length; j++) {
                        // trùng tên hoặc trùng email sẽ đưa vào danh sách không hợp lệ
                        if (
                            users[i].phone == userCheck[j].phone ||
                            users[i].email == userCheck[j].email
                        ) {
                            usersInvalid.push(users[i]);
                        } else {
                            flag++;
                        }
                        if (flag == userCheck.length) {
                            usersValid.push(users[i]);
                        }
                    }
                }
                // xử lý lưu các học sinh đăng ký hợp lệ
                for (var i = 0; i < usersValid.length; i++) {
                    let userSave = new User(usersValid[i]);
                    userSave.active = true;
                    // tạm thời mặc định là học sinh
                    userSave.roleID = "6174f53fa914b28975ebdb6d";
                    // passworld là ngày tháng năm sinh
                    userSave.password =
                        userSave.birthDay.getDate() +
                        "" +
                        (userSave.birthDay.getMonth() + 1) +
                        "" +
                        userSave.birthDay.getFullYear();
                    userSave.save();
                }

                var usersValidJson = null;
                var usersInvalidJson = JSON.stringify(usersInvalid);
                if (isJson(usersInvalidJson)) {
                    // code
                    var fileName = "ImportStudentFail" + Date.now() + ".xlsx";
                    var excelOutput = "src/public/excelexport/" + fileName;
                    var downloadExcel = path.join(
                        __dirname,
                        "../../public/excelexport/" + fileName
                    );
                    var xls = json2xls(usersInvalid);
                    // save file in server
                    fs.writeFileSync(excelOutput, xls, "binary");

                    // download file
                    // console.log(path.resolve('./src/public/excelexport/'+fileName));

                    // res.download(path.resolve('./src/public/excelexport/'+fileName));

                    // console.log("lỗi download");
                } else {
                    // thông báo lỗi
                    //res.send("lỗi rồi!");
                }

                res.render("user/create-list-user", {
                    fileName,
                    usersValid,
                    usersInvalid,
                    success: req.flash("success"),
                    errors: req.flash("error"),
                });
            }
        });
    }
}

module.exports = new UserController();
