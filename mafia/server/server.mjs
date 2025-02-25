// server.mjs

import http from "http";
import app from "./app.js"; // Express 앱 가져오기
import dotenv from "dotenv";
import pool from "./config/database.js"; // DB 연결 가져오기
import cors from "cors"; // 카카오 로그인 차단 방지 cors 설정
import { initMafiaGameSockets } from "./controllers/mafiaGame/mafiaGameController.js";

dotenv.config(); // .env 파일 로드

// -------------------- HTTP 서버 생성 --------------------
const server = http.createServer(app);
const PORT = process.env.PORT || 3000; // 포트가 없으면 3000으로 기본 설정

// ✅ 포트 충돌 방지 (이미 실행 중인 서버가 있다면 자동 종료)
server.on("error", async (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ 포트 ${PORT}가 이미 사용 중입니다.`);
    console.log("🔄 기존 프로세스를 종료하고 다시 실행합니다...");

    // 기존 프로세스 종료 후 다시 실행
    const { exec } = await import("child_process");
    exec(`netstat -ano | findstr :${PORT}`, (error, stdout) => {
      if (stdout) {
        const lines = stdout.trim().split("\n");
        for (const line of lines) {
          const pid = line.trim().split(/\s+/).pop();
          console.log(`🛑 기존 프로세스 종료 중 (PID: ${pid})`);
          exec(`taskkill /PID ${pid} /F`, (killErr, killStdout) => {
            if (!killErr) {
              console.log("✅ 기존 프로세스 종료 완료, 서버를 다시 시작합니다.");
              process.exit(1);
            } else {
              console.error("❌ 기존 프로세스를 종료할 수 없습니다:", killErr.message);
            }
          });
        }
      } else {
        console.error("❌ 기존 프로세스를 찾을 수 없습니다.");
      }
    });
  } else {
    console.error("❌ 서버 오류 발생:", err);
  }
});

// -------------------- Socket.IO 설정 --------------------
import { Server } from "socket.io";
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:1227"],
    methods: ["GET,POST,PUT,DELETE"],
    credentials: true,
  },
});

// ★ 마피아 게임 관련 소켓 기능 초기화  
initMafiaGameSockets(io);

// -------------------- 채팅 및 방 기능 관련 이벤트 핸들러 --------------------
io.on("connection", (socket) => {
  console.log("새 클라이언트 접속:", socket.id);

  // 클라이언트가 특정 방에 입장하도록 처리
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`소켓 ${socket.id}가 방 ${roomId}에 참가`);
    // 방에 입장한 후 현재 인원수를 계산하여 해당 방에 브로드캐스트
    const userCount = getUserCount(roomId);
    io.to(roomId).emit("update user count", { count: userCount });
  });

  // 채팅 메시지 이벤트 (해당 룸에만 처리)
  socket.on("new message", (data) => {
    console.log(`방 ${data.roomId}에서 메시지 수신:`, data);
    io.to(data.roomId).emit("new message", data);
  });

  // 연결 종료 시 해당 소켓이 속한 모든 방에 대해 사용자 수 업데이트
  socket.on("disconnecting", () => {
    socket.rooms.forEach((roomId) => {
      // socket.rooms에는 소켓 자체의 id도 포함되므로 이를 제외
      if (roomId !== socket.id) {
        // 소켓이 나가기 전 방의 사용자 수 - 1을 전달
        const userCount = getUserCount(roomId) - 1;
        io.to(roomId).emit("update user count", { count: userCount });
      }
    });
    console.log("소켓 disconnecting:", socket.id);
  });
});

  // mafiaGame 관련 소켓 설정
  io.on("connection", (socket) => {
    // 연결된 클라이언트의 정보를 확인
    socket.on("joinRoom", (data) => {
      console.log("Received joinRoom data:", data); // 이 부분을 통해 role과 다른 정보 확인
  
      const { nickname, role, roomId } = data;
      console.log(`닉네임: ${nickname}, 역할: ${role}, 방 ID: ${roomId}`); // 로그로 출력
  
      if (role === "마피아") {
        // 마피아 메시지를 받을 준비
        socket.on("mafiaMessage", (message) => {
          //console.log(`Received mafia message from ${message.sender}: ${message.text}`);
  
          // 같은 방에 있는 모든 마피아에게 메시지 전송
          socket.to(roomId).emit("mafiaMessage", message);
        });
      }
  
      // 클라이언트 연결 해제 시 처리
      socket.on("disconnect", () => {
        //console.log(`${nickname} disconnected`);
      });
    });
  });
  

// 현재 roomId의 사용자 수를 반환하는 함수
function getUserCount(roomId) {
  const room = io.sockets.adapter.rooms.get(roomId);
  return room ? room.size : 0;
}

// -------------------- DB 연결 테스트 및 서버 시작 --------------------
(async () => {
  try {
    const [rows] = await pool.execute("SELECT 1 + 1 AS result");
    console.log("✅ DB 연결 성공:", rows);

    // -------------------- 서버 실행 --------------------
    server.listen(PORT, () => {
      console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ DB 연결 실패:", err.message);
    process.exit(1); // DB 연결 실패 시 서버 종료
  }
})();

// -------------------- 서버 종료 시 graceful shutdown --------------------
const gracefulShutdown = () => {
  console.log("❌ 서버 종료 중...");
  // 먼저, Socket.IO의 모든 소켓 연결을 종료
  io.close(() => {
    console.log("모든 소켓 연결 종료됨.");
    // 그 후 HTTP 서버 종료
    server.close(() => {
      console.log("✅ 서버가 정상적으로 종료되었습니다.");
      process.exit(0);
    });
  });
  // 5초 후 강제로 종료 (만약 graceful shutdown이 지연될 경우)
  setTimeout(() => {
    console.warn("시간 초과로 인해 강제 종료합니다.");
    process.exit(0);
  }, 5000);
};

const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:1227"], // ✅ 실행 중인 클라이언트 주소 추가
  methods: "GET,POST,PUT,DELETE",
  credentials: true
};

app.use(cors(corsOptions));

// Ctrl + C 또는 프로세스 종료 시 실행
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
