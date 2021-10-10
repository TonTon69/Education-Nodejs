const User = require("../models/User");

module.exports = {
    requireAuth: async function (req, res, next) {
        if (!req.signedCookies.userId) {
            res.redirect("/login");
            return;
        }
        const user = await User.findOne({ id: req.signedCookies.userId });
        if (!user) {
            res.redirect("/login");
            return;
        }
        res.locals.user = user;
        next();
    },

    authValidate: function (req, res, next) {
        const { email, password } = req.body;
        if (!email && !password) {
            req.flash(
                "error",
                "Vui lòng nhập thông tin dưới đây để đăng nhập tài khoản của bạn!"
            );
            res.render("login", {
                errors: req.flash("error"),
            });
            return;
        }
        if (!email) {
            req.flash("error", "Vui lòng nhập tài khoản email!");
            res.render("login", {
                errors: req.flash("error"),
                values: req.body,
            });
            return;
        }
        const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!email.match(regexEmail)) {
            req.flash("error", "Vui lòng nhập địa chỉ email hợp lệ!");
            res.render("login", {
                errors: req.flash("error"),
                values: req.body,
            });
            return;
        }
        if (!password) {
            req.flash("error", "Vui lòng nhập mật khẩu!");
            res.render("login", {
                errors: req.flash("error"),
                values: req.body,
            });
            return;
        }
        next();
    },
};
