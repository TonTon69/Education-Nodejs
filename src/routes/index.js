const siteRouter = require("./site");
const subjectsRouter = require("./subjects");
const learningRouter = require("./learning");
const exerciseRouter = require("./exercise");
const blogRouter = require("./blog");
const inforRouter = require("./infor");

function route(app) {
    app.use("/", siteRouter);
    app.use("/subjects", subjectsRouter);
    app.use("/learning", learningRouter);
    app.use("/exercise", exerciseRouter);
    app.use("/blog", blogRouter);
    app.use("/infor", inforRouter);
}

module.exports = route;
