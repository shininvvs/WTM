// 데이터베이스 연동
import db from '../../config/database.js';

// 유저 리스트 조회
export const fetchUsers = async () => {
  try {
    const query = `
            SELECT 
              user_id, 
              user_nickname, 
              DATE_FORMAT(enroll_date, '%Y-%m-%d %H:%i:%s') AS enroll_date, 
              user_status 
            FROM tb_user
        `;
    const [rows] = await db.query(query);
    console.log("조회 결과:", rows); // 디버깅: 쿼리 결과 출력
    return rows; // 데이터 반환
  } catch (err) {
    console.error("회원 리스트 조회 서비스 오류:", err);
    throw new Error("회원 리스트 조회 실패");
  }
};

// 유저 상태 변경
export const updateUserStatusService = async (user_id, user_status) => {
  try {
      const query = `UPDATE tb_user SET user_status = ? WHERE user_id = ?`;
      const [result] = await db.query(query, [user_status, user_id]);

      return result.affectedRows > 0; // 업데이트 성공 여부 반환
  } catch (err) {
      console.error("🚨 DB 오류 (Service):", err);
      throw new Error("DB 업데이트 실패");
  }
};