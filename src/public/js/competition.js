const socket = io();

// chat all
socket.on("server-send-count-message", (data) => {
    data === 0 ? $("#count-message").html("") : $("#count-message").html(data);
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
    $("table tbody").html("");
    data.map((room, index) => {
        $("table tbody").append(`
            <tr class='align-middle'>
                <td class='pt-3 pb-3' scope='row'>${index + 1}</td>
                <td>
                    <img class='rounded-pill' src='/img/nobody.jpg' width=30 height=30 />
                    <span class='ms-2'>${room.name}</span>
                </td>
                <td>${room.grade}</td>
                <td>
                    <span class='fw-bold'>${room.subject}:</span>
                    <span>${room.lession}</span>
                </td>
                <td class='text-center'>1/10</td>
                <td class='fw-bold text-warning'>Đang thi...</td>
                <td>
                    <a class='text-primary' href=''>Tham gia</a>
                </td>
            </tr>
        `);
    });
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
    var optionGrade = $("#select-grade option:selected").text();
    var optionSubject = $("#select-subject option:selected").text();
    var optionLession = $("#select-lession option:selected").text();
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
        socket.on("room-id", function (response) {
            // $("#btn-cancel-room").click();
            window.location.href = `/competition/${response}`;
        });
    });

    $("#select-grade").change(function () {
        socket.emit("user-send-option-grade", $(this).val());
    });

    $("#select-subject").change(function () {
        socket.emit("user-send-option-subject", $(this).val());
    });

    $("#select-unit").change(function () {
        socket.emit("user-send-option-unit", $(this).val());
    });

    $("#select-lession").change(function () {
        socket.emit("user-send-option-lession", $(this).val());
    });
});

socket.on("server-send-list-subject-of-user-grade-option", (data) => {
    $("#select-subject").html("");
    data.map((subject) => {
        $("#select-subject").append(`
            <option value=${subject._id}>${subject.name}</option>
        `);
    });
});

socket.on("server-send-list-unit-of-user-subject-option", (data) => {
    $("#select-unit").html("");
    data.map((unit) => {
        $("#select-unit").append(`
            <option value=${unit._id}>${unit.name}</option>
        `);
    });
});

socket.on("server-send-list-lession-of-user-unit-option", (data) => {
    $("#select-lession").html("");
    data.map((lession) => {
        $("#select-lession").append(`
            <option value=${lession._id}>${lession.name}</option>
        `);
    });
});
