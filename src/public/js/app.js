$(document).ready(function () {
    const userAva = $(".header__actions--avatar img");
    const userMenu = $(".header__actions--userMenu");
    const actionsUser = $(".header__actions--user");

    userAva.click(function (e) {
        userMenu.toggleClass("show");
    });

    $(document).click(function (e) {
        // Nếu click bên ngoài đối tượng container thì ẩn nó đi
        if (
            !actionsUser.is(e.target) &&
            actionsUser.has(e.target).length == 0
        ) {
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
    $(function () {
        var path = window.location.href;
        $(".sidebar li a, .sidebar__mobile li a").each(function () {
            if (this.href === path) {
                $(this).addClass("active");
            }
        });
    });

    //Recommend question
    $(".recommend-header").click(function () {
        var parent = $(this).parent();
        parent.find(".recommend-body").slideToggle();
    });

    $(".explain-header").click(function () {
        var parent = $(this).parent();
        parent.find(".explain-body").slideToggle();
    });
});
