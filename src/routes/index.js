const siteRouter = require("./site");
const subjectsRouter = require("./subjects");
const learningRouter = require("./learning");
const exerciseRouter = require("./exercise");
const exercisesRouter = require("./exercises");
const blogRouter = require("./blog");
const inforRouter = require("./infor");
const unitsRouter = require("./units");
const userRouter = require("./user");
const bannersRouter = require("./banners");
const reportsRouter = require("./reports");
const lessionsRouter = require("./lessions");
const theoriesRouter = require("./theories");
const systemRouter = require("./system");
const statisticalsRouter = require("./statisticals");

function route(app) {
    app.use("/", siteRouter);
    app.use("/units", unitsRouter);
    app.use("/subjects", subjectsRouter);
    app.use("/learning", learningRouter);
    app.use("/exercise", exerciseRouter);
    app.use("/blog", blogRouter);
    app.use("/infor", inforRouter);
    app.use("/user", userRouter);
    app.use("/reports", reportsRouter);
    app.use("/banners", bannersRouter);
    app.use("/lessions", lessionsRouter);
    app.use("/theories", theoriesRouter);
    app.use("/exercises", exercisesRouter);
    app.use("/system", systemRouter);
    app.use("/statisticals", statisticalsRouter);
}

module.exports = route;
