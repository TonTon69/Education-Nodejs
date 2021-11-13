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
        var status = room.status;
        $("table tbody").append(`
            <tr class='align-middle' style='line-height: 1.5' id='${
                room.roomName
            }'>
                <td class='pt-3 pb-3' scope='row'>${index + 1}</td>
                <td>
                    <img class='rounded-pill' src=${
                        room.avatar
                    } width=30 height=30 />
                    <span class='ms-2'>${room.master}</span>
                </td>
                <td>${room.gradeID}</td>
                <td>
                    <span class='fw-bold'>${room.subject[0].name}:</span>
                    <span>${room.lession[0].name}</span>
                </td>
                <td class='text-center length-members'>${
                    room.members.length + 1
                }/2</td>
                <td class='fw-bold text-success status'>${status}</td>
                <td>
                    <a class='text-primary' ${
                        status === "Full" || status === "Đang thi..."
                            ? `href="javascript:void(0)" style="opacity: 0.3; cursor: none"`
                            : `href='/competition/${room.roomName}'`
                    }>Tham gia</a>
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
    $("#btn-create-room").click(function () {
        var data = {
            name: $(".user__info .name").text(),
            avatar: $(".user__avatar img").attr("src"),
            username: $(".user__info .username").text(),
            grade: $("#select-grade").val(),
            subject: $("#select-subject").val(),
            unit: $("#select-unit").val(),
            lession: $("#select-lession").val(),
        };

        if (
            data.grade === null ||
            data.subject === null ||
            data.unit === null ||
            data.lession === null
        ) {
            alert("Bạn vui lòng chọn đầy đủ thông tin để tạo phòng!");
            return;
        }

        socket.emit("create-room", data);
        socket.on("room-id", function (response) {
            // $("#btn-cancel-room").click();
            window.location.href = `/competition/${response}`;
        });
    });

    // select option to create a new room
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

    // filter select grade
    $("#select-filter-grade").change(function () {
        socket.emit("user-filter-option-grade", $(this).val());
    });

    // search
    $("#search-client").keyup(function () {
        socket.emit("user-search", $(this).val());
        console.log($(this).val());
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
