import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import loginRoutes from './routes/login/loginRoutes.js';
import registerRoutes from './routes/register/registerRoutes.js';
import mypageRoutes from './routes/user/mypageRoutes.js';
import findRoutes from "./routes/user/findRoutes.js";
import lobbyRoutes from "./routes/lobby/lobbyRoutes.js";
import createRoomRoutes from "./routes/lobby/createRoomRoutes.js";
import userManagementRoutes from "./routes/admin/userManagementRoutes.js";
import joinRoomRoutes from "./routes/lobby/joinRoomRoutes.js";
import pool from './config/database.js';  // ✅ DB 연결 풀 import

dotenv.config();
const app = express();

// -------------------- CORS 설정 --------------------
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:1227"], 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(express.json());
app.options('*', cors()); // Preflight 요청 허용

// -------------------- 라우터 등록 --------------------
app.get("/", (req, res) => {
  res.send("서버가 정상적으로 작동 중입니다!");
});

// ✅ 방 정보 조회 API
app.use("/room", joinRoomRoutes);

// 방 접속할 때 접속 인원 증가/감소 시키려면 routes->controller->service로 나눠서 
// 로직 작성해야해서 아래 로직은 주석 처리해놓음 - 효진
/*
app.get("/room/:roomId", async (req, res) => {
  const { roomId } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM rooms WHERE room_id = ?",
      [roomId]
    );

    if (rows.length > 0) {
      res.json({ success: true, room: rows[0] });
    } else {
      res.status(404).json({ success: false, message: "방을 찾을 수 없습니다." });
    }
  } catch (err) {
    console.error("DB 오류:", err);
    res.status(500).json({ success: false, message: "DB 오류가 발생했습니다." });
  }
});
*/

// ✅ 회원가입 및 로그인 API
app.use('/login', loginRoutes);
app.use('/register', registerRoutes); // 회원가입 관련 API

// ✅ 아이디 & 닉네임 중복 체크 API (올바르게 수정)
app.use('/check-id', registerRoutes);
app.use('/check-nickname', registerRoutes);

// 마이페이지
app.use('/mypage', mypageRoutes);

// 이메일 인증
app.use("/find", findRoutes);

// ✅ Google 로그인 API (`pool.js` 사용)
app.post("/auth/google", async (req, res) => {
  const { google_id, email, name } = req.body;

  if (!google_id || !email || !name) {
    console.error("❌ Google 로그인 요청 실패: 필수 정보 부족");
    return res.status(400).json({ success: false, message: "필수 정보가 부족합니다." });
  }

  try {
    console.log(`🔍 Google 로그인 요청: { google_id: ${google_id}, email: ${email}, name: ${name} }`);

    // ✅ 기존 유저 확인
    const [existingUser] = await pool.query("SELECT * FROM tb_user WHERE user_id = ?", [google_id]);

    if (existingUser.length > 0) {
      console.log("✅ 기존 Google 유저 로그인 성공:", existingUser[0]);
      return res.json({ success: true, user: existingUser[0] });
    } else {
      console.log("📝 신규 Google 유저 등록 요청:", { google_id, name, email });

      // ✅ 닉네임 중복 체크 후 자동 변경
      let newNickname = name;
      let count = 1;
      let nicknameExists = true;

      while (nicknameExists) {
        const [existingNicknames] = await pool.query("SELECT user_nickname FROM tb_user WHERE user_nickname = ?", [newNickname]);
        if (existingNicknames.length === 0) {
          nicknameExists = false; // 닉네임 중복 없음 → 사용 가능
        } else {
          newNickname = `${name}_${count}`; // 닉네임 중복되면 숫자 추가
          count++;
        }
      }

      console.log("✅ 최종 닉네임:", newNickname);

      // ✅ 새 유저 등록
      const insertQuery = "INSERT INTO tb_user (user_id, user_nickname, email, enroll_date) VALUES (?, ?, ?, NOW())";
      const values = [google_id, newNickname, email];

      try {
        await pool.query(insertQuery, values);
        console.log("✅ 신규 Google 유저 저장 완료:", { user_id: google_id, user_nickname: newNickname, email });

        return res.json({ success: true, user: { user_id: google_id, user_nickname: newNickname, email } });
      } catch (dbError) {
        console.error("❌ Google 유저 DB 저장 중 오류 발생:", dbError);
        return res.status(500).json({ success: false, message: "DB 저장 오류 발생", error: dbError });
      }
    }
  } catch (error) {
    console.error("❌ Google 로그인 API 처리 중 오류 발생:", error);
    return res.status(500).json({ success: false, message: "서버 내부 오류 발생", error: error });
  }
});

// ✅ 카카오 로그인 API (DB 저장 포함)
app.post("/auth/kakao", async (req, res) => {
  const { kakao_id, name } = req.body;

  if (!kakao_id || !name) {
    return res.status(400).json({ success: false, message: "필수 정보가 부족합니다." });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM tb_user WHERE user_id = ?", [kakao_id]);

    if (rows.length > 0) {
      return res.json({ success: true, user: rows[0] });
    } else {
      await pool.query("INSERT INTO tb_user (user_id, user_nickname, enroll_date) VALUES (?, ?, NOW())", [kakao_id, name]);
      return res.json({ success: true, user: { user_id: kakao_id, user_nickname: name } });
    }
  } catch (error) {
    console.error("Kakao 로그인 DB 저장 오류:", error);
    return res.status(500).json({ success: false, message: "DB 저장 오류" });
  }
});

// ✅ 회원관리 라우터
app.use("/users", userManagementRoutes);
app.use("/lobby", (req, res, next) => {
  console.log("/lobby 경로로 요청이 들어왔습니다.");
  next();
}, lobbyRoutes); 

app.use("/createRoom", createRoomRoutes);

// ✅ 404 처리 (잘못된 경로 요청 시)
app.use((req, res, next) => {
  res.status(404).json({ message: "요청한 경로를 찾을 수 없습니다." });
});

// -------------------- 오류 처리 --------------------
app.use((err, req, res, next) => {
  console.error("❌ 서버 오류 발생:", err.message);
  res.status(500).json({ message: "❌ 서버 내부 오류가 발생했습니다.", error: err.message });
});

export default app;
