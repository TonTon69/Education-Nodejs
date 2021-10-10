const User = require("../models/User");

class InforController {
    // [PUT]/infor/:username
    async update(req, res, next) {
        const user = await User.findOne({ _id: req.signedCookies.userId });
        User.updateOne({ id: user.id }, req.body)
            .then(() => {
                req.flash("success", "Cập nhật thông tin thành công!");
                res.redirect("/infor");
            })
            .catch(next);
    }
}

module.exports = new InforController();
