const siteRouter = require("./site");
const subjectsRouter = require("./subjects");

function route(app) {
    app.use("/", siteRouter);
    app.use("/subjects", subjectsRouter);
}

module.exports = route;
