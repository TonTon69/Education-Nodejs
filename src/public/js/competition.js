const socket = io();

// chat all
socket.on("server-send-count-message", (data) => {
    $("#count-message").html(data);
});

socket.on("server-send-message", (data) => {
    if (data.username === $(".user__info .username").text()) {
        $(".msg-content").append(`
                    <div class='msg right-msg'>
                        <div class='ms-2'>
                            <div class='msg-img' style='background-image: url(${data.avatar})'></div>
                        </div>
                        <div class='msg-bubble'>
                            <div class='msg-info'>
                                <div class='msg-info-name'>${data.name}</div>
                                <div class='msg-info-time'>${data.time}</div>
                            </div>
                            <div class='msg-text'>${data.message}</div>
                        </div>
                    </div>
                `);
    } else {
        $(".msg-content").append(`
                    <div class='msg left-msg'>
                        <div class='me-2'>
                            <div class='msg-img' style='background-image: url(${data.avatar})'></div>
                        </div>
                        <div class='msg-bubble'>
                            <div class='msg-info'>
                                <div class='msg-info-name'>${data.name}</div>
                                <div class='msg-info-time'>${data.time}</div>
                            </div>
                            <div class='msg-text'>${data.message}</div>
                        </div>
                    </div>
                `);
    }
});

socket.on("user-writing-message", (data) => {
    if (data.username === $(".user__info .username").text()) {
        $(".msg-loading").html("");
    } else {
        $(".msg-loading").html(`
                    <div class='msg left-msg'>
                        <div class='me-2'>
                            <div class='msg-img' style='background-image: url(${data.avatar})'></div>
                        </div>
                        <div class='msg-bubble'>
                            <img src='/img/loading.gif' width='40' />
                        </div>
                    </div>
                `);
    }
});

socket.on("user-stopping-message", () => {
    $(".msg-loading").html("");
});

// create-room
socket.on("server-send-rooms", (data) => {
    $("table tbody").append(`
        <tr>
            <td class='pt-3 pb-3' scope='row'>1</td>
            <td>
                <img class='rounded-pill' src='/img/nobody.jpg' width=30 height=30 />
                <span class='ms-2'>${data.name}</span>
            </td>
            <td>${data.grade}</td>
            <td>
                <span class='fw-bold'>${data.subject}:</span>
                <span>${data.lession}</span>
            </td>
            <td>1/10</td>
            <td class='fw-bold text-warning'>Đang thi...</td>
            <td>
                <a class='text-primary' href=''>Tham gia</a>
            </td>
        </tr>
    `);
});

$(document).ready(function () {
    var chat = $(".chat");
    var chatShow = $(".chat-show");
    var closeChat = $(".msger-header-options");

    closeChat.click(function () {
        chat.hide(400);
        chatShow.show(400);
    });

    chatShow.click(function () {
        $(this).hide(400);
        chat.show(400);
    });

    // send message when click send btn
    $(".msger-send-btn").click(function () {
        if ($(".msger-input").val() === "") {
            return;
        }

        var dt = new Date();
        let time;
        if (dt.getMinutes() > 9) {
            time = dt.getHours() + ":" + dt.getMinutes();
        } else {
            time = dt.getHours() + ":" + "0" + dt.getMinutes();
        }
        var data = {
            name: $(".user__info .name").text(),
            username: $(".user__info .username").text(),
            avatar: $(".user__avatar img").attr("src"),
            message: $(".msger-input").val(),
            time: time,
        };
        socket.emit("user-send-message", data);
        $(".msger-input").val("");
    });

    // send message when press enter
    $(".msger-input").keyup(function (e) {
        if ($(this).val() === "") {
            return;
        }

        if (e.keyCode === 13) {
            var dt = new Date();
            let time;
            if (dt.getMinutes() > 9) {
                time = dt.getHours() + ":" + dt.getMinutes();
            } else {
                time = dt.getHours() + ":" + "0" + dt.getMinutes();
            }
            var data = {
                name: $(".user__info .name").text(),
                username: $(".user__info .username").text(),
                avatar: $(".user__avatar img").attr("src"),
                message: $(".msger-input").val(),
                time: time,
            };
            socket.emit("user-send-message", data);
            $(this).val("");
        }
    });

    // typing when chat
    $(".msger-input").focusin(function () {
        var data = {
            username: $(".user__info .username").text(),
            avatar: $(".user__avatar img").attr("src"),
        };
        socket.emit("writing-message", data);
    });

    $(".msger-input").focusout(function () {
        socket.emit("stopping-message");
    });

    // btn click create room
    $("#btn-create-room").click(function () {
        var data = {
            name: $(".user__info .name").text(),
            avatar: $(".user__avatar img").attr("src"),
            username: $(".user__info .username").text(),
            grade: $("#select-grade option:selected").text(),
            subject: $("#select-subject option:selected").text(),
            lession: $("#select-lession option:selected").text(),
        };
        socket.emit("create-room", data);
        $("#btn-cancel-room").click();
    });
});
