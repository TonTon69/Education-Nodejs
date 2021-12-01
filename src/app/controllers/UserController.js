const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const User = require("../models/User");
const Role = require("../models/Role");
const Grade = require("../models/Grade");
const bcrypt = require("bcrypt");
const isJson = require("is-json");
const json2xls = require("json2xls");
const fs = require("fs");
const path = require("path");
const readXlsxFile = require("read-excel-file/node");
const moment = require("moment");
const XLSX = require("xlsx");

class UserController {
    async listUser(req, res, next) {
        try {
            let perPage = 3;
            let page = req.params.page || 1;
            const roles = await Role.find({});
            const users = await User.aggregate([
                {
                    $lookup: {
                        from: "roles",
                        localField: "roleID",
                        foreignField: "_id",
                        as: "Role",
                    },
                },
                { $skip: perPage * page - perPage },
                { $limit: perPage },
            ]);

            const usersCount = await User.countDocuments();
            res.render("user/list-user", {
                roles,
                users,
                current: page,
                pages: Math.ceil(usersCount / perPage),
                success: req.flash("success"),
                errors: req.flash("error"),
            });
        } catch (err) {
            res.render("error");
        }
    }

    // [GET]/user/list/:page
    async pagination(req, res) {
        try {
            let perPage = 3;
            let page = req.params.page || 1;
            const roles = await Role.find({});
            const users = await User.aggregate([
                {
                    $lookup: {
                        from: "roles",
                        localField: "roleID",
                        foreignField: "_id",
                        as: "Role",
                    },
                },
                { $skip: perPage * page - perPage },
                { $limit: perPage },
            ]);

            const usersCount = await User.countDocuments();
            res.render("user/list-user", {
                roles,
                users,
                current: page,
                pages: Math.ceil(usersCount / perPage),
                success: req.flash("success"),
                errors: req.flash("error"),
            });
        } catch (err) {
            res.render("error");
        }
    }

    // [GET]/user/create
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

    // [POST]/user/create
    async createUser(req, res) {
        const formUser = req.body;

        const checkEmail = await User.findOne({ email: formUser.email });
        const checkPhone = await User.findOne({ phone: formUser.phone });
        if (checkEmail) {
            req.flash("error", "Email này đã tồn tại!");
            res.redirect("back");
            return;
        }

        if (checkPhone) {
            req.flash("error", "Số điện thoại này đã tồn tại!");
            res.redirect("back");
            return;
        }

        formUser.fullname = formUser.firstName + " " + formUser.lastName;
        formUser.active = true;
        formUser.avatar = "/img/nobody.jpg";
        formUser.password = await bcrypt.hash(formUser.phone, 10);

        const user = new User(formUser);
        await user.save();
        req.flash("success", "Đăng ký thành công tài khoản mới!");
        res.redirect("back");
    }

    // [POST]/user/list
    async searchFilter(req, res) {
        const searchString = req.body.query;
        const option = req.body.option;
        let users = [];
        if (searchString) {
            users = await User.aggregate([
                {
                    $match: {
                        fullname: { $regex: searchString, $options: "$i" },
                    },
                },
                {
                    $lookup: {
                        from: "roles",
                        localField: "roleID",
                        foreignField: "_id",
                        as: "role",
                    },
                },
            ]);
        } else if (option) {
            users = await User.aggregate([
                {
                    $match: {
                        roleID: ObjectId(option),
                    },
                },
                {
                    $lookup: {
                        from: "roles",
                        localField: "roleID",
                        foreignField: "_id",
                        as: "role",
                    },
                },
            ]);
        } else {
            users = await User.aggregate([
                {
                    $lookup: {
                        from: "roles",
                        localField: "roleID",
                        foreignField: "_id",
                        as: "role",
                    },
                },
            ]);
        }
        res.render("helper/table-user", { users });
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
        if (req.file == undefined) {
            req.flash("error", "Vui lòng tải lên một tệp excel!");
            res.redirect("back");
            return;
        }

        let pathExcel = path.resolve(
            __dirname,
            "../../public/uploads/" + req.file.filename
        );

        readXlsxFile(pathExcel).then(async (rows) => {
            rows.shift();
            let users = [];
            let userCheck = await User.find({});

            rows.forEach((row) => {
                let user = new User({
                    fullname: row[1],
                    birthDay: row[2],
                    phone: row[3],
                    address: row[4],
                    email: row[5].toString().toLowerCase(),
                    avatar: "/img/nobody.jpg",
                });
                users.push(user);
            });

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
            if (usersValid.length > 0) {
                for (var i = 0; i < usersValid.length; i++) {
                    let userSave = new User(usersValid[i]);
                    userSave.active = true;
                    // tạm thời mặc định là học sinh
                    userSave.roleID = "6174f53fa914b28975ebdb6d";
                    // passworld là so dien thoai
                    userSave.password = await bcrypt.hash(userSave.phone, 10);
                    await userSave.save();
                }
            }

            let fileName;
            if (usersInvalid.length > 0) {
                let usersInvalidExcel = [];
                usersInvalid.forEach((item, index) => {
                    let user = {
                        STT: index + 1,
                        "Họ và tên": item.fullname,
                        "Ngày sinh": moment(item.birthDay).format("DD-MM-YYYY"),
                        "Số điện thoại": item.phone,
                        "Địa chỉ hiện tại": item.address,
                        "Địa chỉ email": item.email,
                    };
                    usersInvalidExcel.push(user);
                });

                var usersInvalidJson = JSON.stringify(usersInvalidExcel);
                if (isJson(usersInvalidJson)) {
                    // code
                    fileName = "ImportStudentFail" + Date.now() + ".xlsx";
                    var excelOutput = "src/public/exports/" + fileName;
                    var xls = json2xls(usersInvalidExcel);
                    // save file in server
                    fs.writeFileSync(excelOutput, xls, "binary");
                } else {
                    // thông báo lỗi
                    //res.send("lỗi rồi!");
                }
            }

            res.render("user/create-list-user", {
                fileName,
                usersValid,
                usersInvalid,
                success: req.flash("success"),
                errors: req.flash("error"),
            });
        });
    }

    // [POST]/user/export
    async export(req, res, next) {
        const users = await User.aggregate([
            {
                $lookup: {
                    from: "roles",
                    localField: "roleID",
                    foreignField: "_id",
                    as: "role",
                },
            },
        ]);

        let usersExcel = [];
        users.forEach((item, index) => {
            let user = {
                STT: index + 1,
                "Họ tên": item.fullname,
                "Địa chỉ email": item.email,
                "Số điện thoại": item.phone,
                "Địa chỉ hiện tại": item.address,
                "Ngày sinh": moment(item.birthDay).format("DD-MM-YYYY"),
                "Chức vụ": item.role[0].description,
            };
            usersExcel.push(user);
        });

        /* create a new blank workbook */
        var wb = XLSX.utils.book_new();
        var temp = JSON.stringify(usersExcel);
        temp = JSON.parse(temp);
        var ws = XLSX.utils.json_to_sheet(temp);
        let down = path.resolve(
            __dirname,
            `../../public/exports/thong-ke-danh-sach-nguoi-dung.xlsx`
        );
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, down);
        res.download(down);
    }
}

module.exports = new UserController();
