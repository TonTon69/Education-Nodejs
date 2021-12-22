const Subject = require("../models/Subject");
const Lession = require("../models/Lession");
const ExerciseCategory = require("../models/ExerciseCategory");
const Exercise = require("../models/Exercise");
const Result = require("../models/Result");
const Unit = require("../models/Unit");
const User = require("../models/User");
const Statistical = require("../models/Statistical");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const readXlsxFile = require("read-excel-file/node");
const path = require("path");
const XLSX = require("xlsx");
const { htmlToText } = require("html-to-text");

class ExerciseController {
    // [GET]/exercise/:slug?name=lession
    async exercise(req, res) {
        try {
            const subject = await Subject.findOne({ slug: req.params.slug });
            if (subject) {
                const lession = await Lession.findOne({ slug: req.query.name });
                const exercises = await Exercise.aggregate([
                    {
                        $match: {
                            lessionID: ObjectId(lession.id),
                        },
                    },
                    {
                        $lookup: {
                            from: "exercise-categories",
                            localField: "ceID",
                            foreignField: "_id",
                            as: "Cate",
                        },
                    },
                    {
                        $project: { answer: 0, explain: 0 },
                    },
                    { $sample: { size: 20 } },
                ]);

                // làm lại tất cả
                const statistical = await Statistical.findOne({
                    userID: ObjectId(req.signedCookies.userId),
                    lessionID: lession._id,
                });

                if (statistical) {
                    const results = await Result.find({
                        statisticalID: statistical._id,
                    });
                    const resultsUserIdArray = results.map(({ _id }) => _id);
                    if (results.length > 0) {
                        await Result.deleteMany({
                            _id: { $in: resultsUserIdArray },
                        });
                        await Statistical.deleteOne({ _id: statistical._id });
                    }
                }

                // bảng xếp hạng theo bài học
                const ranks = await Statistical.aggregate([
                    {
                        $match: {
                            lessionID: ObjectId(lession._id),
                        },
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "userID",
                            foreignField: "_id",
                            as: "user",
                        },
                    },
                    { $sort: { score: -1, time: 1 } },
                    {
                        $limit: 10,
                    },
                ]);

                res.render("exercises/exercise", {
                    lession,
                    subject,
                    exercises,
                    ranks,
                });
            } else {
                res.render("error");
            }
        } catch (error) {
            res.render("error");
        }
    }

    // [POST]/exercise/:slug?name=lession
    async postExercise(req, res) {
        try {
            const lession = await Lession.findOne({ slug: req.query.name });
            if (lession) {
                const myJsonData = req.body.objectData;
                const myJsonObj = Object.assign({}, ...myJsonData);
                const myTime = req.body.time;
                const myExercise = req.body.exercise;

                let score = 0;
                let totalAnswerTrue = 0;
                const exercises = await Exercise.find({
                    lessionID: lession._id,
                });
                exercises.forEach(function (exercise) {
                    if (
                        myJsonObj.name == exercise._id &&
                        myJsonObj.value == exercise.answer
                    ) {
                        score += 100 / exercises.length;
                        totalAnswerTrue++;
                    }
                });
                const findStatistical = await Statistical.findOne({
                    userID: ObjectId(req.signedCookies.userId),
                    lessionID: lession._id,
                });
                if (findStatistical) {
                    if (req.body.currentQa == exercises.length) {
                        await Statistical.updateOne(
                            { _id: findStatistical._id },
                            {
                                time: myTime,
                                $inc: {
                                    totalAnswerTrue: totalAnswerTrue,
                                    score: score,
                                },
                                isDone: true,
                            }
                        );
                    } else {
                        await Statistical.updateOne(
                            { _id: findStatistical._id },
                            {
                                time: myTime,
                                $inc: {
                                    totalAnswerTrue: totalAnswerTrue,
                                    score: score,
                                },
                            }
                        );
                    }

                    if (Object.keys(myJsonObj).length === 0) {
                        const result = new Result({
                            statisticalID: findStatistical._id,
                            exerciseID: myExercise,
                            option: "",
                        });
                        await result.save();
                    } else {
                        const result = new Result({
                            statisticalID: findStatistical._id,
                            exerciseID: myJsonObj.name,
                            option: myJsonObj.value,
                        });
                        await result.save();
                    }
                } else {
                    const statistical = new Statistical({
                        lessionID: lession._id,
                        userID: req.signedCookies.userId,
                        totalAnswerTrue: totalAnswerTrue,
                        score: score,
                        time: myTime,
                        isDone: false,
                    });
                    await statistical.save();

                    if (Object.keys(myJsonObj).length === 0) {
                        const result = new Result({
                            statisticalID: statistical._id,
                            exerciseID: myExercise,
                            option: "",
                        });
                        await result.save();
                    } else {
                        const result = new Result({
                            statisticalID: statistical._id,
                            exerciseID: myJsonObj.name,
                            option: myJsonObj.value,
                        });
                        await result.save();
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    // [GET]/exercise?lession
    async detail(req, res) {
        if (ObjectId.isValid(req.query.lession)) {
            const lession = await Lession.findById(req.query.lession);
            if (lession) {
                const exercises = await Exercise.aggregate([
                    { $match: { lessionID: ObjectId(req.query.lession) } },
                    {
                        $lookup: {
                            from: "exercise-categories",
                            localField: "ceID",
                            foreignField: "_id",
                            as: "category",
                        },
                    },
                    {
                        $lookup: {
                            from: "lessions",
                            localField: "lessionID",
                            foreignField: "_id",
                            as: "lession",
                        },
                    },
                    {
                        $unwind: "$lession",
                    },
                    {
                        $lookup: {
                            from: "units",
                            localField: "lession.unitID",
                            foreignField: "_id",
                            as: "lession.unit",
                        },
                    },
                    {
                        $unwind: "$lession.unit",
                    },
                    {
                        $lookup: {
                            from: "subjects",
                            localField: "lession.unit.subjectID",
                            foreignField: "_id",
                            as: "lession.unit.subject",
                        },
                    },
                ]);

                if (exercises.length > 0) {
                    const categories = await ExerciseCategory.find({});

                    res.render("exercises/detail", {
                        exercises,
                        categories,
                        success: req.flash("success"),
                        errors: req.flash("error"),
                    });
                } else {
                    res.redirect(
                        `/exercises/create?lession=${req.query.lession}`
                    );
                }
            } else {
                res.render("error");
            }
        } else {
            res.render("error");
        }
    }

    // [PUT]/exercises/:id
    async update(req, res) {
        let {
            answer,
            option1,
            option2,
            option3,
            option4,
            question,
            recommend,
            explain,
            ceID,
            audioUrl,
        } = req.body;

        if (answer === "A") {
            answer = option1;
        } else if (answer === "B") {
            answer = option2;
        } else if (answer === "C") {
            answer = option3;
        } else if (answer === "D") {
            answer = option4;
        }

        await Exercise.updateOne(
            { _id: req.params.id },
            {
                question,
                option1,
                option2,
                option3,
                option4,
                answer,
                recommend,
                explain,
                ceID,
                audioUrl,
            }
        );
        req.flash("success", "Cập nhật thành công!");
        res.redirect("back");
    }

    // [GET]/exercises/create
    async create(req, res) {
        if (ObjectId.isValid(req.query.lession)) {
            const lession = await Lession.findOne({ _id: req.query.lession });
            const unit = await Unit.findOne({ _id: lession.unitID });
            const subject = await Subject.findOne({ _id: unit.subjectID });
            const categories = await ExerciseCategory.find({});
            res.render("exercises/create", {
                lession,
                unit,
                subject,
                categories,
                success: req.flash("success"),
                errors: req.flash("error"),
            });
        } else {
            res.render("error");
        }
    }

    // [POST]/exercises/create
    async postCreate(req, res) {
        let {
            lessionID,
            answer,
            option1,
            option2,
            option3,
            option4,
            question,
            recommend,
            explain,
            ceID,
            audioUrl,
        } = req.body;

        if (answer === "A") {
            answer = option1;
        } else if (answer === "B") {
            answer = option2;
        } else if (answer === "C") {
            answer = option3;
        } else if (answer === "D") {
            answer = option4;
        }

        const exercise = new Exercise({
            lessionID,
            question,
            option1,
            option2,
            option3,
            option4,
            answer,
            recommend,
            explain,
            ceID,
            audioUrl,
        });
        await exercise.save();
        req.flash("success", "Thêm mới thành công!");
        res.redirect("back");
    }

    // [DELETE]/exercises
    async delete(req, res) {
        await Exercise.deleteOne({ _id: req.params.id });
        req.flash("success", "Xóa thành công!");
        res.redirect("back");
    }

    // [POST]/exercises/upload
    async upload(req, res) {
        try {
            if (req.file == undefined) {
                req.flash("error", "Vui lòng tải lên một tệp excel!");
                res.redirect("back");
                return;
            }
            let fileExcel = path.resolve(
                __dirname,
                "../../public/uploads/" + req.file.filename
            );

            readXlsxFile(fileExcel).then(async (rows) => {
                rows.shift();
                let exercises = [];
                let categories = await ExerciseCategory.find({});

                rows.forEach((row) => {
                    categories.forEach((category) => {
                        if (row[9].toString().toLowerCase() === category.type) {
                            row[9] = category._id;
                        }
                    });

                    if (row[6] === "A" || row[6] === "a") {
                        row[6] = row[2];
                    } else if (row[6] === "B" || row[6] === "b") {
                        row[6] = row[3];
                    } else if (row[6] === "C" || row[6] === "c") {
                        row[6] = row[4];
                    } else if (row[6] === "D" || row[6] === "d") {
                        row[6] = row[5];
                    }

                    let exercise = new Exercise({
                        question: row[1],
                        option1: row[2],
                        option2: row[3],
                        option3: row[4],
                        option4: row[5],
                        answer: row[6],
                        recommend: row[7],
                        explain: row[8],
                        ceID: row[9],
                        lessionID: req.body.lessionID,
                    });

                    exercises.push(exercise);
                });

                Exercise.create(exercises)
                    .then(() => {
                        req.flash("success", "Đã tải tệp lên thành công!");
                        res.redirect("back");
                    })
                    .catch((error) => {
                        req.flash(
                            "error",
                            "Không thể nhập dữ liệu vào cơ sở dữ liệu!"
                        );
                        res.redirect("back");
                    });
            });
        } catch (error) {
            console.log(error);
        }
    }

    // [POST]/exercises/:id/export
    async export(req, res) {
        const lession = await Lession.findById(req.params.id);
        if (lession) {
            const exercises = await Exercise.aggregate([
                { $match: { lessionID: ObjectId(lession._id) } },
                {
                    $lookup: {
                        from: "exercise-categories",
                        localField: "ceID",
                        foreignField: "_id",
                        as: "category",
                    },
                },
            ]);

            let exercisesExcel = [];
            exercises.forEach((item, index) => {
                let exercise = {
                    STT: index + 1,
                    "Câu hỏi": htmlToText(item.question, { wordwrap: 130 }),
                    "Option 1": item.option1,
                    "Option 2": item.option2,
                    "Option 3": item.option3,
                    "Option 4": item.option4,
                    "Đáp án": item.answer,
                    "Gợi ý": item.recommend,
                    "Lời giải": htmlToText(item.explain, { wordwrap: 130 }),
                    "Loại câu hỏi": item.category[0].type,
                };
                exercisesExcel.push(exercise);
            });

            var wb = XLSX.utils.book_new();
            var temp = JSON.stringify(exercisesExcel);
            temp = JSON.parse(temp);
            var ws = XLSX.utils.json_to_sheet(temp);
            let down = path.resolve(
                __dirname,
                `../../public/exports/thong-ke-danh-sach-cau-hoi-bai-${lession.slug}.xlsx`
            );
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
            XLSX.writeFile(wb, down);
            res.download(down);
        } else {
            req.flash("error", "Tải tệp không thành công. Vui lòng thử lại!");
            res.redirect("back");
        }
    }
}

module.exports = new ExerciseController();
