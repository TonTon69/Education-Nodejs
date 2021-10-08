const Subject = require("../models/Subject");
const Lession = require("../models/Lession");
const ExerciseCategory = require("../models/ExerciseCategory");
const Exercise = require("../models/Exercise");
class ExerciseController {
    // [GET]/exercise/:slug?name=lession
    async exercise(req, res, next) {
        try {
            const subject = await Subject.findOne({ slug: req.params.slug });
            if (subject) {
                const lession = await Lession.findOne({ slug: req.query.name });
                const exercises = await Exercise.find({
                    lessionID: lession.id,
                });
                const exerciseCategories = await ExerciseCategory.find({});

                res.render("exercises/exercise", {
                    lession,
                    subject,
                    exercises,
                    exerciseCategories,
                });
            } else {
                res.render("error");
            }
        } catch (error) {
            res.render("error");
        }
    }

    async postExercise(req, res, next) {
        try {
            const subject = req.params.slug;
            const lession = req.query.name;

            const exercises = await Exercise.find({ slug: lession });
            var sumQuestions = exercises.length;

            var sumCorrectAnswer = 0;
            var score = 0;
            var scoreTotal = 0;

            const myJsonData = req.body.objectData;
            for (let i = 0; i < myJsonData.length; i++) {
                const ques = await Exercise.findById({
                    _id: myJsonData[i].name,
                });
                if (myJsonData[i].value === ques.answer) {
                    sumCorrectAnswer++;
                }
            }
            score = (sumCorrectAnswer / sumQuestions) * 100;
            scoreTotal += score;
            console.log(scoreTotal);

            res.writeHead(200, { "Content-Type": "text/plain" });

            // var tab = req.query.tab;
            // if (tab) {
            //     res.render("exercises/exercise", {
            //         scoreTotal,
            //     });
            // }
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = new ExerciseController();
