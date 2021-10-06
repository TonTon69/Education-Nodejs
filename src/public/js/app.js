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

    //StopWatch
    $("#stopwatch").stopwatch().stopwatch("start");

    //Exercise
    $(".score__achieved").hide();
    $(".questions__true").hide();
    $("#btn-load-result").attr("style", "display: none !important");

    $("#btn-submit-exercise").click(function () {
        $(".quiz").scrollTop(0);
        $(".score__achieved").show();
        $(".questions__true").show();
        $("#stopwatch").stopwatch().stopwatch("stop");
        $(this).attr("style", "display: none !important");
        $("#btn-load-result").show();

        const options = $(".quiz .form-check-input");
        $.each(options, function (index, option) {
            option.disabled = true;
        });

        const arrayTemp = [];
        const arrayOptionChecked = $(
            "input[type=radio]:checked",
            ".quiz"
        ).toArray();
        $.each(arrayOptionChecked, function (index, item) {
            arrayTemp.push({
                name: item.getAttribute("name"),
                value: item.getAttribute("value"),
            });
        });
        console.log(arrayOptionChecked);
    });
});
