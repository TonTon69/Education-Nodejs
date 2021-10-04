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

    //StopWatch
    // $(function () {
    //     $('#stop__watch').stopwatch().stopwatch('start');
    // });
});
