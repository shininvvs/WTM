import pool from '../../config/database.js';
import bcrypt from 'bcrypt';

export const login = async (req, res) => {
  const { user_id, user_pwd } = req.body;

  // ✅ 모든 필드 입력 확인
  if (!user_id || !user_pwd) {
    return res.status(400).json({ success: false, message: '❌ 모든 필드를 입력하세요.' });
  }

  try {
    // ✅ 유저 정보 조회
    const [rows] = await pool.execute("SELECT * FROM tb_user WHERE user_id = ? AND user_status = 'y'", [user_id]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: '❌ 존재하지 않는 아이디입니다.' });
    }

    const user = rows[0]; // 첫 번째 사용자 정보

    // ✅ 비밀번호 검증
    const isMatch = await bcrypt.compare(user_pwd, user.user_pwd);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: '❌ 비밀번호가 일치하지 않습니다.' });
    }

    // ✅ 로그인 성공 응답
    return res.status(200).json({ 
      success: true, 
      message: '✅ 로그인 성공', 
      user: { user_id: user.user_id, user_nickname: user.user_nickname } 
    });

  } catch (error) {
    console.error('로그인 오류:', error);
    return res.status(500).json({ success: false, message: '❌ 서버 오류가 발생했습니다.' });
  }
};
