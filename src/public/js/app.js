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
    var questions = $(".exercise-item");

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
        message.text("");
        answerTrue.text("");
        $("#stopwatch").stopwatch().stopwatch("start");
        divAnswerTrue.attr("style", "display: none !important");
        $(".explain").attr("style", "display: none !important");
        $(".recommend").attr("style", "display: block !important");

        count += 1;

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
        } else {
            for (let i = 0; i < questions.length; i++) {
                questions[i].className = "exercise-item";
            }
            questions[count].className = "exercise-item active";
        }

        if (count == questions.length) {
            $("#stopwatch").stopwatch().stopwatch("stop");
            $(".quiz").attr("style", "display: none !important");
            var submitResultForm = document.forms["submit-result-form"];
            var url = $(location).attr("href");
            // var urlParams = new URLSearchParams(window.location.search);
            // var params = urlParams.get("name");
            submitResultForm.setAttribute("action", `${url}?tab=result`);
            submitResultForm.submit();
        }
    });

    for (var i = 0; i < qaAns.length; i++) {
        qaAns[i].onclick = function () {
            btnCheckResult.attr("style", "display: flex !important");
        };
    }
    btnCheckResult.click(function () {
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
        } else {
            message.text("Bạn đã chọn sai");
            divAnswerTrue.addClass("invalid");
        }

        var arrayTemp = [];
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
            data: JSON.stringify({ objectData: arrayTemp }),
            success: function (data) {},
        });
    });

    // btnCheckResult.click(function () {
    //     for (var i = 0; i < qaAns.length; i++) {
    //         var valid = qaAns[i].getAttribute("valid");
    //         console.log(valid);
    //     }
    // });

    //Exercise
    // $(".score__achieved").hide();
    // $(".questions__true").hide();
    // $("#btn-load-result").attr("style", "display: none !important");

    // $("#btn-submit-exercise").click(function (e) {
    //     e.preventDefault();
    //     $(".quiz").scrollTop(0);
    //     $(".score__achieved").show();
    //     $(".questions__true").show();
    //     $("#stopwatch").stopwatch().stopwatch("stop");
    //     $(this).attr("style", "display: none !important");
    //     $("#btn-load-result").show();

    //     const options = $(".quiz .form-check-input");
    //     $.each(options, function (index, option) {
    //         option.disabled = true;
    //     });

    //     const arrayTemp = [];
    //     const arrayOptionChecked = $(
    //         "input[type=radio]:checked",
    //         ".quiz"
    //     ).toArray();
    //     $.each(arrayOptionChecked, function (index, item) {
    //         arrayTemp.push({
    //             name: item.getAttribute("name"),
    //             value: item.getAttribute("value"),
    //         });
    //     });
    //     // const time = $("#stopwatch").html();
    //     // const params = new window.URLSearchParams(window.location.search);
    //     // console.log(params.get("name"));
    //     // const path = $(location).attr("pathname");
    //     // console.log(path);

    //     $.ajax({
    //         type: "POST",
    //         url: $(location).attr("href"),
    //         contentType: "application/json",
    //         data: JSON.stringify({ objectData: arrayTemp }),
    //         success: function (data) {
    //             // const obj = JSON.parse(data);
    //             // console.log(obj);
    //             // $(".questions__true .bottom").html(obj);
    //         },
    //     });
    // });
});
