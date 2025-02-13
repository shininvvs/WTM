// mafia/server/services/socket.js
const { Server } = require("socket.io");

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:1227", "http://localhost:3000"],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    const { nickname, roomId } = socket.handshake.query || {};
    console.log(`${nickname} connected to ${roomId}`);

    socket.join(roomId); // 사용자를 특정 방에 참여

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`${nickname}님이 ${roomId}에 입장`);
    });

    // ✅ 메시지를 올바르게 보낼 수 있도록 수정
    socket.on("new message", (msg) => {
      console.log(`방(${msg.roomId})에서 받은 메시지:`, msg);

      // ✅ nickname과 roomId가 빠지지 않도록 객체 수정
      const fullMessage = {
        nickname: msg.nickname, 
        message: msg.message, 
        roomId: msg.roomId  // ✅ roomId 추가
      };

      io.to(msg.roomId).emit("new message", fullMessage);
    });

    socket.on("disconnect", () => {
      console.log(`${nickname}님이 ${roomId}에서 퇴장`);
    });

  });

  return io;
}

module.exports = initSocket;

/*
윤홍문 메모
// 로비 채팅
io.on("connection", (socket) => {
  const { nickname } = socket.handshake.query;
  console.log(`${nickname} connected`);

  socket.on("new message", (msg, callback) => {
    if (!msg.message.trim()) {
      console.log("빈 메시지는 처리하지 않습니다.");
      return;
    }

    console.log("서버쪽 수신된 메시지:", msg);
    io.emit("new message", { nickname: msg.nickname, message: msg.message });
    callback({ status: "ok" });
  });

  socket.on("disconnect", () => {
    console.log(`${nickname} disconnected`);
  });
});

*/
