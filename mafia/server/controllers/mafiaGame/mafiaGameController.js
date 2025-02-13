// mafiaGameController.js

import mafiaGameService from "../../services/mafiaGame/mafiaGameService.js";

/**
 * Socket.IO를 활용하여 마피아 게임 관련 소켓 이벤트 초기화 함수
 */
function initMafiaGameSockets(io) {
  io.on("connection", (socket) => {
    // 클라이언트가 보낸 쿼리에서 nickname과 roomId 추출
    const { nickname, roomId } = socket.handshake.query || {};
    console.log(`[마피아게임] 유저 접속: ${nickname} (소켓ID=${socket.id}, roomId=${roomId})`);

    // 1) 해당 룸에 사용자 등록
    mafiaGameService.registerUser(roomId, nickname, socket.id);

    // 2) 방장 여부 전송
    socket.emit("host status", {
      isHost: mafiaGameService.isHost(roomId, nickname),
    });

    // 3) 입장 메시지 및 활성 플레이어 목록 업데이트 (해당 룸에 전송)
    io.to(roomId).emit("new message", {
      username: "SYSTEM",
      message: `${nickname}님이 입장했습니다.`,
      roomId: roomId,
    });

    io.to(roomId).emit("update user count", {
      count: mafiaGameService.getUserCount(roomId),
    });
    io.to(roomId).emit("update active players", {
      players: Array.from(mafiaGameService.getActiveUsers(roomId).keys()),
    });

    // (A) 일반 메시지 전송 처리
    /*
    socket.on("new message", (msg, callback) => {
      console.log("[서버] 수신 메시지:", msg);
      if (!msg.message.trim()) {
        console.log("빈 메시지는 처리하지 않습니다.");
        return;
      }
      io.to(msg.roomId).emit("new message", {
        username: msg.username,
        message: msg.message,
        roomId: msg.roomId,
      });
      if (callback) {
        callback({ status: "ok" });
      }
    });*/

    // (B) 게임 시작 요청 처리
    socket.on("start game", () => {
      if (!mafiaGameService.isHost(roomId, nickname)) {
        console.log(`[마피아게임] ${nickname}님은 룸 ${roomId}의 방장이 아닙니다.`);
        return;
      }
      if (mafiaGameService.getUserCount(roomId) >= 4) {
        mafiaGameService.startGame(roomId);
        io.to(roomId).emit("game started");
        mafiaGameService.getActiveUsers(roomId).forEach((userObj, name) => {
          io.to(userObj.socketId).emit("assigned role", {
            username: name,
            role: userObj.role,
          });
        });
        mafiaGameService.proceedToPhase(roomId, (phase) => {
          console.log(`[룸 ${roomId} Phase] ${phase.name} 시작, ${phase.duration}초`);
          io.to(roomId).emit("phase changed", {
            phase: phase.name,
            duration: phase.duration,
          });
        });
      }
    });

    // 의사 보호 기능 처리 시작 -----------------
    // 의사 보호 기능 처리
    socket.on("doctor save", (targetPlayer, callback) => {
      console.log(`[보호 요청] ${nickname} 님이 ${targetPlayer}를 보호합니다.`);

      const currentUser = mafiaGameService.getActiveUsers().get(nickname);
      if (!currentUser || currentUser.role !== "의사") {
        console.log("보호 권한이 없습니다.");
        if (callback)
          callback({ status: "error", message: "보호 권한이 없습니다." });
        return;
      }

      if (currentUser.saved) {
        console.log("이미 보호를 진행했습니다.");
        if (callback)
          callback({ status: "error", message: "이미 보호를 진행했습니다." });
        return;
      }

      const targetUser = mafiaGameService.getActiveUsers().get(targetPlayer);
      if (!targetUser) {
        console.log("대상 플레이어를 찾을 수 없습니다.");
        if (callback)
          callback({ status: "error", message: "대상 플레이어를 찾을 수 없습니다." });
        return;
      }

      // 보호된 플레이어 저장
      mafiaGameService.setSavedPlayer(roomId, targetPlayer);
      currentUser.saved = true;
      console.log(`[보호 성공] ${targetPlayer}이(가) 의사에 의해 보호됨.`);
      if (callback)
        callback({ status: "ok", message: `${targetPlayer}을(를) 보호했습니다.` });
    });

    // (B) 밤이 끝날 때 생존 여부 결정
    socket.on("end night phase", (roomId) => {
      const savedPlayer = mafiaGameService.getSavedPlayer(roomId);
      const killedPlayer = mafiaGameService.getKilledPlayer(roomId);

      if (savedPlayer && killedPlayer && savedPlayer === killedPlayer) {
        console.log(`[의사 보호] ${savedPlayer}이(가) 생존!`);
        io.to(roomId).emit("player saved", { message: `${savedPlayer}이(가) 의사의 보호로 생존했습니다!` });
      } else if (killedPlayer) {
        console.log(`[사망] ${killedPlayer}이(가) 사망.`);
        io.to(roomId).emit("player killed", { message: `${killedPlayer}이(가) 사망했습니다.` });
      }

      // 데이터 초기화
      mafiaGameService.clearNightActions(roomId);
    });
    // 의사 보호 기능 처리 끝 -----------------

    // (C) 경찰 조사 기능 처리
    socket.on("investigate", (targetPlayer, callback) => {
      console.log(`[조사 요청] ${nickname} 님이 ${targetPlayer}를 조사합니다. (룸: ${roomId})`);
      const currentUser = mafiaGameService.getActiveUsers(roomId).get(nickname);
      if (!currentUser || currentUser.role !== "경찰") {
        console.log("조사 권한이 없습니다.");
        if (callback)
          callback({ status: "error", message: "조사 권한이 없습니다." });
        return;
      }
      if (currentUser.investigated) {
        console.log("이미 조사를 진행했습니다.");
        if (callback)
          callback({ status: "error", message: "이미 조사를 진행했습니다." });
        return;
      }
      const targetUser = mafiaGameService.getActiveUsers(roomId).get(targetPlayer);
      if (!targetUser) {
        console.log("대상 플레이어를 찾을 수 없습니다.");
        if (callback)
          callback({ status: "error", message: "대상 플레이어를 찾을 수 없습니다." });
        return;
      }
      let resultMessage = "";
      if (targetUser.role === "마피아") {
        resultMessage = "마피아가 맞습니다.";
      } else {
        resultMessage = "마피아가 아닙니다.";
      }
      currentUser.investigated = true;
      socket.emit("investigation result", { message: resultMessage });
      if (callback) callback({ status: "ok" });
    });

    // (D) 소켓 연결 해제 처리
    socket.on("disconnect", () => {
      console.log(`[마피아게임] 유저 퇴장: ${nickname}`);
      mafiaGameService.unregisterUser(roomId, nickname);
      io.to(roomId).emit("new message", {
        username: "SYSTEM",
        message: `${nickname}님이 퇴장했습니다.`,
        roomId: roomId,
      });
      io.to(roomId).emit("update user count", {
        count: mafiaGameService.getUserCount(roomId),
      });
      io.to(roomId).emit("update active players", {
        players: Array.from(mafiaGameService.getActiveUsers(roomId).keys()),
      });
    });
  });
}

export { initMafiaGameSockets };
