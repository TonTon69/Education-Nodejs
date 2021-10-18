const User = require("../models/User");

const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

class InforController {
    // [PUT]/infor/:id
    async update(req, res, next) {
        const user = await User.findOne({ _id: req.signedCookies.userId });
        await User.updateOne({ _id: user.id }, req.body);
        req.flash("success", "Cập nhật thông tin thành công!");
        res.redirect("back");
    }

    // [PUT]/infor/:id/avatar
    async changeAvatar(req, res, next) {
        const user = await User.findOne({ _id: req.signedCookies.userId });
        if (req.file) {
            req.body.avatar = req.file.path.split("/").slice(-2).join("/");
            cloudinary.uploader.upload(req.file.path, async (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    await User.updateOne({ _id: user.id }, result.url);
                    req.flash("success", "Cập nhật ảnh đại diện thành công!");
                    res.redirect("back");
                }
            });
        } else {
            console.log(123);
        }
    }
}

module.exports = new InforController();
