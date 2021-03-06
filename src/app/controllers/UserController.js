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
const cloudinary = require("../../config/cloud/index");

class UserController {
    async listUser(req, res) {
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
    async create(req, res) {
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
            req.flash("error", "Email n??y ???? t???n t???i!");
            res.redirect("back");
            return;
        }

        if (checkPhone) {
            req.flash("error", "S??? ??i???n tho???i n??y ???? t???n t???i!");
            res.redirect("back");
            return;
        }

        formUser.fullname = formUser.firstName + " " + formUser.lastName;
        formUser.active = true;
        formUser.avatar = "/img/nobody.jpg";
        formUser.password = await bcrypt.hash(formUser.phone, 10);

        const user = new User(formUser);
        await user.save();
        req.flash("success", "????ng k?? th??nh c??ng t??i kho???n m???i!");
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

    async listRole(req, res) {
        const roles = await Role.find({});
        res.render("user/list-role", {
            success: req.flash("success"),
            errors: req.flash("error"),
            roles,
        });
    }

    async update(req, res) {
        var user = await User.findOne({ _id: req.params.id });
        const roles = await Role.find({});
        res.render("user/update", {
            user,
            roles,
        });
    }

    async putUpdate(req, res) {
        await User.updateOne({ _id: req.params.id }, req.body);
        req.flash("success", "???? c???p nh???t th??nh c??ng!");
        res.redirect("/user/list-user");
    }

    async deleteUser(req, res) {
        const user = await User.findById(req.params.id);
        const public_id = user.avatar
            .split("/")
            .slice(-1)
            .join("")
            .split(".")[0];
        cloudinary.uploader.destroy(public_id);
        await User.deleteOne({ _id: req.params.id });
        req.flash("success", "???? x??a th??nh c??ng!");
        res.redirect("back");
    }

    //[POST] user/create-list-user
    async addUserList(req, res) {
        if (req.file == undefined) {
            req.flash("error", "Vui l??ng t???i l??n m???t t???p excel!");
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
                    // tr??ng t??n ho???c tr??ng email s??? ????a v??o danh s??ch kh??ng h???p l???
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

            // x??? l?? l??u c??c h???c sinh ????ng k?? h???p l???
            if (usersValid.length > 0) {
                for (var i = 0; i < usersValid.length; i++) {
                    let userSave = new User(usersValid[i]);
                    userSave.active = true;
                    // t???m th???i m???c ?????nh l?? h???c sinh
                    userSave.roleID = "6174f53fa914b28975ebdb6d";
                    // passworld l?? so dien thoai
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
                        "H??? v?? t??n": item.fullname,
                        "Ng??y sinh": moment(item.birthDay).format("DD-MM-YYYY"),
                        "S??? ??i???n tho???i": item.phone,
                        "?????a ch??? hi???n t???i": item.address,
                        "?????a ch??? email": item.email,
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
                    // th??ng b??o l???i
                    //res.send("l???i r???i!");
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
    async export(req, res) {
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
                "H??? t??n": item.fullname,
                "?????a ch??? email": item.email,
                "S??? ??i???n tho???i": item.phone,
                "?????a ch??? hi???n t???i": item.address,
                "Ng??y sinh": moment(item.birthDay).format("DD-MM-YYYY"),
                "Ch???c v???": item.role[0].description,
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
