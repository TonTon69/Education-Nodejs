const siteRouter = require("./site");
const subjectsRouter = require("./subjects");
const learningRouter = require("./learning");

function route(app) {
    app.use("/", siteRouter);
    app.use("/subjects", subjectsRouter);
    app.use("/learning", learningRouter);
}

module.exports = route;
