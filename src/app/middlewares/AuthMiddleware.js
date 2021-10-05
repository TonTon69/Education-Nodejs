const User = require("../models/User");

module.exports = {
    requireAuth: function (req, res, next) {
        if (!req.signedCookies.userId) {
            res.redirect("/login");
            return;
        }
        User.findOne({ _id: req.signedCookies.userId }).then((user) => {
            if (!user) {
                res.redirect("/login");
                return;
            }
            res.locals.user = user;
            next();
        });
    },
};
