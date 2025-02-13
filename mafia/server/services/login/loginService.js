import pool from '../../config/database.js';
import bcrypt from 'bcrypt';

export const registerUser = async (user_id, user_pwd, user_nickname) => {
  try {
    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(user_pwd, 10);

    // 닉네임 중복 확인
    const [existingUser] = await pool.query(`SELECT * FROM tb_user WHERE user_nickname = ?`, [user_nickname]);
    if (existingUser.length > 0) {
      return { success: false, message: '이미 존재하는 닉네임입니다.' };
    }

    // 회원 정보 삽입
    const [result] = await pool.query(`
      INSERT INTO tb_user (user_id, user_pwd, user_nickname) VALUES (?, ?, ?)`,
      [user_id, hashedPassword, user_nickname]
    );

    return { success: true, message: '회원가입 성공' };
  } catch (error) {
    console.error('회원가입 오류:', error);
    return { success: false, message: '서버 오류가 발생했습니다.' };
  }
};
