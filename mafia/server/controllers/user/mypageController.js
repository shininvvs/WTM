import pool from '../../config/database.js';
import bcrypt from 'bcrypt';

// ✅ 마이페이지 조회
export const getUserProfile = async (req, res) => {
  const { user_id } = req.params; // URL에서 user_id 받기

  try {
    const [rows] = await pool.execute(`
      SELECT user_id, user_nickname, total_games, wins, loses, enroll_date
      FROM tb_user
      WHERE user_id = ?
    `, [user_id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "❌ 사용자를 찾을 수 없습니다." });
    }

    const user = rows[0];
    const winRate = user.total_games > 0 ? ((user.wins / user.total_games) * 100).toFixed(2) : "0.00";

    return res.status(200).json({ success: true, user: { ...user, winRate } });
  } catch (error) {
    console.error("마이페이지 조회 오류:", error);
    return res.status(500).json({ success: false, message: "❌ 서버 오류 발생" });
  }
};

// ✅ 회원 탈퇴
export const deactivateUser = async (req, res) => {
  
  const { user_id } = req.body; // 요청에서 user_id 받기

  try {
    const [result] = await pool.execute(
      "UPDATE tb_user SET user_status = 'n' WHERE user_id = ?", 
      [user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "❌ 사용자를 찾을 수 없습니다." });
    }

    return res.status(200).json({ success: true, message: "✅ 그동안 이용해주셔서 고맙습니다." });
  } catch (error) {
    console.error("회원 탈퇴 오류:", error);
    return res.status(500).json({ success: false, message: "❌ 서버 오류 발생" });
  }
};

  // ✅ 비밀번호 변경
export const changePassword = async (req, res) => {
    const { user_id, old_password, new_password } = req.body;
  
    try {
      // 기존 비밀번호 확인
      const [rows] = await pool.execute("SELECT user_pwd FROM tb_user WHERE user_id = ?", [user_id]);
  
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: "❌ 사용자를 찾을 수 없습니다." });
      }
  
      const user = rows[0];
      const isMatch = await bcrypt.compare(old_password, user.user_pwd);
  
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "❌ 기존 비밀번호가 일치하지 않습니다." });
      }
  
      // 새로운 비밀번호 암호화 후 저장
      const hashedPassword = await bcrypt.hash(new_password, 10);
      await pool.execute("UPDATE tb_user SET user_pwd = ? WHERE user_id = ?", [hashedPassword, user_id]);
  
      return res.status(200).json({ success: true, message: "✅ 비밀번호가 변경되었습니다." });
    } catch (error) {
      console.error("비밀번호 변경 오류:", error);
      return res.status(500).json({ success: false, message: "❌ 서버 오류 발생" });
    }
  };
  