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

const { checkAdmin } = require("../app/middlewares/AuthMiddleware");

function route(app) {
    app.use("/", siteRouter);
    app.use("/units", checkAdmin, unitsRouter);
    app.use("/subjects", subjectsRouter);
    app.use("/learning", learningRouter);
    app.use("/exercise", exerciseRouter);
    app.use("/blog", blogRouter);
    app.use("/infor", inforRouter);
    app.use("/user", checkAdmin, userRouter);
    app.use("/reports", checkAdmin, reportsRouter);
    app.use("/banners", checkAdmin, bannersRouter);
    app.use("/lessions", lessionsRouter);
    app.use("/theories", theoriesRouter);
    app.use("/exercises", exercisesRouter);
    app.use("/system", checkAdmin, systemRouter);
    app.use("/statisticals", checkAdmin, statisticalsRouter);
}

module.exports = route;
