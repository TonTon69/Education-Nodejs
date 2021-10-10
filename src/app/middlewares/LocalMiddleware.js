const User = require("../models/User");

module.exports = {
    userLocal: async function (req, res, next) {
        try {
            const user = await User.findOne({ id: req.signedCookies.userId });
            res.locals.user = user;
            next();
        } catch (error) {
            console.log(error);
        }
    },
};
