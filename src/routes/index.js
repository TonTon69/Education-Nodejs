const siteRouter = require("./site");
const subjectsRouter = require("./subjects");
const learningRouter = require("./learning");
const exerciseRouter = require("./exercise");

function route(app) {
    app.use("/", siteRouter);
    app.use("/subjects", subjectsRouter);
    app.use("/learning", learningRouter);
    app.use("/exercise", exerciseRouter);
}

module.exports = route;
