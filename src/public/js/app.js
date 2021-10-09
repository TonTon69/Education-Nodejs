$(document).ready(function () {
    const userAva = $(".header__actions--avatar img");
    const userMenu = $(".header__actions--userMenu");

    userAva.click(function (e) {
        userMenu.toggleClass("show");
    });

    $(document).click(function (e) {
        // Nếu click bên ngoài đối tượng container thì ẩn nó đi
        if (!userAva.is(e.target) && userAva.has(e.target).length === 0) {
            userMenu.removeClass("show");
        }
    });

    $(function () {
        $(".subjects__item .brand").each(function (index) {
            var colorR = Math.floor(Math.random() * 256);
            var colorG = Math.floor(Math.random() * 256);
            var colorB = Math.floor(Math.random() * 256);
            $(this).css(
                "background-color",
                "rgb(" + colorR + "," + colorG + "," + colorB + ")"
            );
        });
    });

    // Highlight the active link in a navigation menu
    // for (var i = 0; i < document.links.length; i++) {
    //     if (document.links[i].href === document.URL) {
    //         document.links[i].classList.add("active");
    //     }
    // }

    //Recommend question
    $(".recommend-header").click(function () {
        var parent = $(this).parent();
        parent.find(".recommend-body").slideToggle();
    });

    $(".explain-header").click(function () {
        var parent = $(this).parent();
        parent.find(".explain-body").slideToggle();
    });

    //StopWatch
    $("#stopwatch").stopwatch().stopwatch("start");

    //Load question
    var btnNextQuestion = $("#btn-next-question");
    var btnCheckResult = $("#btn-check-result");
    var questions = $(".quiz .exercise-item");

    var message = $(".exercise-item .check-result .message");
    var divAnswerTrue = $(".exercise-item .check-result");
    var answerTrue = $(".exercise-item .check-result .answer-true");
    var qaAns = $(".exercise-item .form-check input");

    questions.first().addClass("active");
    btnCheckResult.attr("style", "display: none !important");
    divAnswerTrue.attr("style", "display: none !important");
    $(".explain").attr("style", "display: none !important");

    var count = 0;
    var scoreCount = 0;

    btnNextQuestion.click(function () {
        count += 1;

        message.text("");
        answerTrue.text("");
        $("#stopwatch").stopwatch().stopwatch("start");
        divAnswerTrue.attr("style", "display: none !important");
        $(".explain").attr("style", "display: none !important");
        $(".recommend").attr("style", "display: block !important");

        var qaAnsChecked = $(".exercise-item.active .form-check input:checked");
        if (qaAnsChecked.length == 0) {
            if (confirm("Bạn muốn bỏ qua câu này?") == true) {
                for (let i = 0; i < questions.length; i++) {
                    questions[i].className = "exercise-item";
                }
                questions[count].className = "exercise-item active";
            } else {
                count -= 1;
            }
            $(".questions__true .bottom").text(`${count}`);
        } else {
            for (let i = 0; i < questions.length; i++) {
                questions[i].className = "exercise-item";
            }
            questions[count].className = "exercise-item active";
            $(".questions__true .bottom").text(`${count}`);
        }

        if (count == questions.length) {
            $("#stopwatch").stopwatch().stopwatch("stop");
            var path = $(location).attr("pathname").split("/")[2];
            var params = new window.URLSearchParams(window.location.search);
            var query = params.get("name");
            var submitResultForm = document.forms["submit-result-form"];
            submitResultForm.setAttribute(
                "action",
                "/result/" + path + `?name=${query}`
            );
            submitResultForm.submit();
        }
    });

    for (var i = 0; i < qaAns.length; i++) {
        qaAns[i].onclick = function () {
            btnCheckResult.attr("style", "display: flex !important");
        };
    }
    btnCheckResult.click(function (e) {
        e.preventDefault();
        $(".exercise-item.active .form-check input").attr("disabled", true);
        divAnswerTrue.attr("style", "display: block !important");
        $(".explain").attr("style", "display: block !important");
        $(".recommend").attr("style", "display: none !important");
        btnCheckResult.attr("style", "display: none !important");
        $("#stopwatch").stopwatch().stopwatch("stop");

        var answerValid = $(
            ".exercise-item.active .form-check input[valid=valid]"
        );
        var parent = answerValid.parent();
        var validText = parent.find(".form-check-label").text();
        answerTrue.text(` ~ Đáp án đúng: ${validText.substring(0, 1)}`);

        var answer = $(".exercise-item.active .form-check input:checked");
        var score = $("#score").text();
        var scoreAchieved = $(".score__achieved .bottom");
        if (answer.is("[valid]")) {
            scoreCount += parseInt(score);
            scoreAchieved.text(`${scoreCount}/100`);
            message.text("Bạn đã chọn đúng");
            divAnswerTrue.addClass("valid");
            divAnswerTrue.removeClass("invalid");
        } else {
            message.text("Bạn đã chọn sai");
            divAnswerTrue.addClass("invalid");
            divAnswerTrue.removeClass("valid");
        }

        var arrayTemp = [];
        // var arrayOptionChecked = $(".exercise-item .form-check input:checked");
        $.each(answer, function (index, item) {
            arrayTemp.push({
                name: item.getAttribute("name"),
                value: item.getAttribute("value"),
            });
        });

        $.ajax({
            type: "POST",
            url: $(location).attr("href"),
            contentType: "application/json",
            data: JSON.stringify({
                objectData: arrayTemp,
                time: $("#stopwatch").text(),
                score: $(".score__achieved .bottom").text(),
            }),
            success: function (data) {},
        });
    });
});
