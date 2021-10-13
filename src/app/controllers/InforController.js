const User = require("../models/User");

class InforController {
    // [PUT]/infor/:id
    async update(req, res, next) {
        const user = await User.findOne({ _id: req.signedCookies.userId });
        if (user) {
            await User.updateOne({ _id: user.id }, req.body);
            req.flash("success", "Cập nhật thông tin thành công!");
            res.redirect("/infor");
        }
    }
}

module.exports = new InforController();
