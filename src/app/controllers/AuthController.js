const User = require("../models/User");
const bcrypt = require("bcrypt");

class AuthController {
    // [GET]/password/change
    passwordChange(req, res) {
        res.render("auth/password-change", {
            errors: req.flash("error"),
            success: req.flash("success"),
        });
    }

    // [PUT]/password/change/:id
    async putPasswordChange(req, res, next) {
        const user = await User.findOne({ _id: req.signedCookies.userId });
        const { passwordOld, passwordNew } = req.body;

        const matchPassword = await bcrypt.compare(passwordOld, user.password);
        const passwordNewHash = await bcrypt.hash(passwordNew, 10);

        if (!matchPassword) {
            req.flash("error", "Mật khẩu cũ không chính xác!");
            res.render("auth/password-change", {
                errors: req.flash("error"),
                values: req.body,
            });
            return;
        }

        await User.updateOne({ _id: user.id }, { password: passwordNewHash });
        req.flash("success", "Đổi mật khẩu thành công!");
        res.redirect("back");
    }
}

module.exports = new AuthController();
