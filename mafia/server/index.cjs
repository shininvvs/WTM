const http = require("http");
const dotenv = require("dotenv");
const initSocket = require("./services/socket");
const app = require("./server.cjs"); // server.cjs에서 Express 앱 가져오기

// .env 파일 로드 (config/.env 경로)
dotenv.config({ path: __dirname + "/config/.env" });

// HTTP 서버 생성
const server = http.createServer(app);

// WebSocket 초기화
initSocket(server);

// 서버 실행
const PORT = process.env.PORT || 3000; // 기본 포트는 .env에서 가져오고, 없으면 1227 사용
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
z``