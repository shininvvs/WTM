// src/controllers/mafiaGame/mafiaGameController.js
import mafiaGameService, { proceedToPhase, skipPhaseTime, extendPhaseTime } from "../../services/mafiaGame/mafiaGameService.js";

function initMafiaGameSockets(io) {
  io.on("connection", (socket) => {
    const { nickname, roomId } = socket.handshake.query || {};
    console.log(`[마피아게임] 유저 접속: ${nickname} (소켓ID=${socket.id}, roomId=${roomId})`);

    // 1) 사용자 등록
    mafiaGameService.registerUser(roomId, nickname, socket.id);

    // 2) 방장 여부 전송
    socket.emit("host status", { isHost: mafiaGameService.isHost(roomId, nickname) });

    // 3) 입장 메시지 및 활성 플레이어 업데이트 (해당 룸)
    io.to(roomId).emit("new message", {
      username: "SYSTEM",
      message: `${nickname}님이 입장했습니다.`,
      roomId,
    });
    io.to(roomId).emit("update user count", { count: mafiaGameService.getUserCount(roomId) });
    io.to(roomId).emit("update active players", { players: Array.from(mafiaGameService.getActiveUsers(roomId).keys()) });

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
        proceedToPhase(roomId, (phase) => {
          console.log(`[룸 ${roomId} Phase] ${phase.name} 시작, ${phase.duration}초`);
          io.to(roomId).emit("phase changed", {
            phase: phase.name,
            duration: phase.duration,
          });
        });
      }
    });

    socket.on("skip phase", (callback) => {
      const newRemaining = skipPhaseTime(roomId, nickname);
      if (newRemaining === null) {
        if (callback) callback({ status: "error", message: "이미 스킵 기능을 사용했습니다." });
      } else if (newRemaining === 0) {
        const newPhase = mafiaGameService.getCurrentPhaseName(roomId);
        io.to(roomId).emit("phase changed", { phase: newPhase, duration: 0 });
        if (callback) callback({ status: "ok", message: "시간이 모두 소진되어 다음 단계로 전환합니다." });
      } else {
        io.to(roomId).emit("phase time adjusted", { remaining: newRemaining });
        if (callback) callback({ status: "ok", message: `남은 시간이 ${newRemaining / 1000}초로 단축되었습니다.` });
      }
    });

    // 새롭게 추가된 "extend phase" 이벤트 핸들러
    socket.on("extend phase", (callback) => {
      const newRemaining = extendPhaseTime(roomId, nickname);
      if (newRemaining === null) {
        if (callback) callback({ status: "error", message: "이미 시간 확장 기능을 사용했습니다." });
      } else {
        io.to(roomId).emit("phase time adjusted", { remaining: newRemaining });
        if (callback) callback({ status: "ok", message: `남은 시간이 ${newRemaining / 1000}초로 연장되었습니다.` });
      }
    });

    socket.on("doctor save", (targetPlayer, callback) => {
      console.log(`[보호 요청] ${nickname} 님이 ${targetPlayer}를 보호합니다.`);
      const currentUser = mafiaGameService.getActiveUsers(roomId).get(nickname);
      if (!currentUser || currentUser.role !== "의사") {
        if (callback) callback({ status: "error", message: "보호 권한이 없습니다." });
        return;
      }
      if (currentUser.saved) {
        if (callback) callback({ status: "error", message: "이미 보호를 진행했습니다." });
        return;
      }
      const targetUser = mafiaGameService.getActiveUsers(roomId).get(targetPlayer);
      if (!targetUser) {
        if (callback) callback({ status: "error", message: "대상 플레이어를 찾을 수 없습니다." });
        return;
      }
      mafiaGameService.setSavedPlayer(roomId, targetPlayer);
      currentUser.saved = true;
      if (callback) callback({ status: "ok", message: `${targetPlayer}을(를) 보호했습니다.` });
    });

    socket.on("end night phase", () => {
      const savedPlayer = mafiaGameService.getSavedPlayer(roomId);
      const killedPlayer = mafiaGameService.getKilledPlayer(roomId);
      if (savedPlayer && killedPlayer && savedPlayer === killedPlayer) {
        io.to(roomId).emit("player saved", { message: `${savedPlayer}이(가) 의사의 보호로 생존했습니다!` });
      } else if (killedPlayer) {
        io.to(roomId).emit("player killed", { message: `${killedPlayer}이(가) 사망했습니다.` });
      }
      mafiaGameService.clearNightActions(roomId);
    });

    socket.on("investigate", (targetPlayer, callback) => {
      console.log(`[조사 요청] ${nickname} 님이 ${targetPlayer}를 조사합니다. (룸: ${roomId})`);
      const currentUser = mafiaGameService.getActiveUsers(roomId).get(nickname);
      if (!currentUser || currentUser.role !== "경찰") {
        if (callback) callback({ status: "error", message: "조사 권한이 없습니다." });
        return;
      }
      if (currentUser.investigated) {
        if (callback) callback({ status: "error", message: "이미 조사를 진행했습니다." });
        return;
      }
      const targetUser = mafiaGameService.getActiveUsers(roomId).get(targetPlayer);
      if (!targetUser) {
        if (callback) callback({ status: "error", message: "대상 플레이어를 찾을 수 없습니다." });
        return;
      }
      let resultMessage = targetUser.role === "마피아" ? "마피아가 맞습니다." : "마피아가 아닙니다.";
      currentUser.investigated = true;
      socket.emit("investigation result", { message: resultMessage });
      if (callback) callback({ status: "ok" });
    });

    socket.on("kick user", (targetPlayer, callback) => {
      if (!mafiaGameService.isHost(roomId, nickname)) {
        if (callback) callback({ status: "error", message: "권한이 없습니다." });
        return;
      }
      mafiaGameService.unregisterUser(roomId, targetPlayer);
      io.to(roomId).emit("new message", {
        username: "SYSTEM",
        message: `${targetPlayer}님이 방장에 의해 추방되었습니다.`,
        roomId,
      });
      io.to(roomId).emit("update user count", { count: mafiaGameService.getUserCount(roomId) });
      io.to(roomId).emit("update active players", { players: Array.from(mafiaGameService.getActiveUsers(roomId).keys()) });
      const targetUser = mafiaGameService.getActiveUsers(roomId).get(targetPlayer);
      if (targetUser) {
        io.to(targetUser.socketId).emit("kicked", { message: "당신은 추방되었습니다." });
      }
      if (callback) callback({ status: "ok" });
    });

    socket.on("disconnect", () => {
      mafiaGameService.unregisterUser(roomId, nickname);
      io.to(roomId).emit("new message", {
        username: "SYSTEM",
        message: `${nickname}님이 퇴장했습니다.`,
        roomId,
      });
      io.to(roomId).emit("update user count", { count: mafiaGameService.getUserCount(roomId) });
      io.to(roomId).emit("update active players", { players: Array.from(mafiaGameService.getActiveUsers(roomId).keys()) });
    });
  });
}

export { initMafiaGameSockets };
