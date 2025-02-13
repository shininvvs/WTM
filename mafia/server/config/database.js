import mysql from "mysql2/promise";
import dotenv from "dotenv";

// .env 파일 로드 (config 폴더에 있을 경우)
dotenv.config({ path: './config/.env' }); // .env 경로 설정

// MySQL DB 연결 풀 생성
const pool = mysql.createPool({
  host: process.env.DB_HOST,          // 데이터베이스 호스트
  user: process.env.DB_USER,          // 사용자명
  password: process.env.DB_PASSWORD,  // 비밀번호
  database: process.env.DB_NAME,      // 데이터베이스 이름
  port: process.env.DB_PORT,
  waitForConnections: true,
  queueLimit: 0,
});

export default pool; // DB 연결 풀 내보내기
