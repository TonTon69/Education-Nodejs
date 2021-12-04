const User = require("../models/User");
const slugify = require("slugify");
const cloudinary = require("../../config/cloud/index");

class InforController {
    // [PUT]/infor/:id
    async update(req, res) {
        const { fullname, phone, birthDay, address } = req.body;
        const user = await User.findOne({
            fullname,
            phone,
            birthDay,
            address,
        });
        if (user) {
            res.redirect("back");
            return;
        }

        // const checkUsername = await User.findOne({
        //     username: slugify(fullname).toLowerCase(),
        // });

        // let username = "";
        // if (checkUsername && checkUsername.fullname !== fullname) {
        //     username = slugify(
        //         fullname.toLowerCase() +
        //             "-" +
        //             Math.floor(1000 + Math.random() * 9000)
        //     );
        // } else {
        //     username = slugify(fullname).toLowerCase();
        // }

        await User.updateOne(
            { _id: req.signedCookies.userId },
            {
                fullname,
                phone,
                birthDay,
                address,
                // username: slugify(fullname).toLowerCase(),
            }
        );
        req.flash("success", "Cập nhật thông tin thành công!");
        res.redirect("back");
    }

    // [PUT]/infor/:id/avatar
    async changeAvatar(req, res) {
        const user = await User.findOne({ _id: req.signedCookies.userId });
        if (req.file) {
            req.body.avatar = req.file.path.split("/").slice(-2).join("/");
            cloudinary.uploader.upload(req.file.path, async (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    await User.updateOne(
                        { _id: user.id },
                        { avatar: result.url }
                    );
                    req.flash("success", "Cập nhật ảnh đại diện thành công!");
                    res.redirect("back");
                }
            });
        }
    }
}

module.exports = new InforController();
