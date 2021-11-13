const socket = io();
var roomId = "#{room[0].roomName}";

//- xử lý user tham gia vào phòng
socket.emit("client-send-room-name", {
    roomId: roomId,
    userName: $(".user__info .username").text(),
    fullname: $(".user__info .name").text(),
    avatar: $(".user__avatar img").attr("src"),
});

//- real time thành viên khi join phòng
socket.on("server-send-members-in-room", (data) => {
    //- $("#btn-start").attr("disabled", false);
    $(".members .row").html("");
    data.map((member) => {
        $(".members .row").append(`
                    <div class='col-sm-4'>
                        <div class='card shadow border-0 mb-4'>
                            <div class='card-body'>
                                <div class='d-flex align-items-center'>
                                    <img src='${member.avatar}' class='rounded-pill' width=100 height=100 style='object-fit: cover' />
                                    <div class='ms-4'>
                                        <span class='text-warning fw-bold'>Thành viên</span>
                                        <span class='d-block mt-2'>${member.fullname}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `);
    });
});

socket.on("server-send-list-questions", (data) => {
    $("#overlay").show();
    var counter = 10;
    var interval = setInterval(function () {
        counter--;
        if (counter <= 0) {
            clearInterval(interval);
            $("#overlay").hide();
            $("#btn-start").attr("style", "display: none !important");
            $(".master").attr("style", "display: none !important");
            $(".members").hide();
            return;
        } else {
            $(".countdown").text(counter);
        }
    }, 1000);
});

// handle server send length members to click start
let lengthMembersInRoom = 0;
socket.on("server-send-length-members-in-room", (data) => {
    lengthMembersInRoom = data;
});

//- chủ phòng out room
socket.on("master-handle-out-room", () => {
    alert("Chủ phòng đã rời phòng!");
    window.location.href = `/competition`;
});

document.addEventListener("DOMContentLoaded", function () {
    var currentUser = $(".user__info .username").text();
    if (roomId !== currentUser) {
        $("#btn-start").attr("style", "display: none !important");
    }

    //- btn out room click
    $("#btn-out-room").click(function () {
        socket.emit("client-handle-out-room", roomId);
        window.location.href = `/competition`;
    });

    //- btn start room click
    $("#btn-start").click(() => {
        if (lengthMembersInRoom > 0) {
            socket.emit("start-room", roomId);
            return;
        }

        Eggy({
            title: "Không đủ thành viên",
            message: "Phòng phải có ít nhất 2 thành viên để bắt đầu thi đấu!!!",
            type: "warning",
            duration: 5000,
        });
    });
});
