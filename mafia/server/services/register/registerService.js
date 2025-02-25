import pool from '../../config/database.js';

// ✅ 중복 체크 함수 (아이디, 닉네임, 이메일)
export const checkDuplicate = async (column, value) => {
  try {
    // 🚨 SQL 인젝션 방지: 허용된 컬럼명만 사용
    const validColumns = ['user_id', 'user_nickname', 'email'];
    if (!validColumns.includes(column)) {
      throw new Error('❌ 잘못된 컬럼명 요청!');
    }

    const query = `SELECT ${column} FROM tb_user WHERE LOWER(TRIM(${column})) = LOWER(TRIM(?))`;
    const [rows] = await pool.execute(query, [value]);

    return rows.length > 0;
  } catch (error) {
    console.error(`❌ ${column} 중복 체크 오류:`, error);
    return false;
  }
};

// ✅ 아이디 중복 체크 서비스
export const checkUserIdService = async (user_id) => {
  return await checkDuplicate('user_id', user_id);
};

// ✅ 닉네임 중복 체크 서비스
export const checkUserNicknameService = async (user_nickname) => {
  return await checkDuplicate('user_nickname', user_nickname);
};

// ✅ 이메일 중복 체크 서비스
export const checkUserEmailService = async (email) => {
  return await checkDuplicate('email', email);
};

// ✅ 회원 정보를 DB에 저장하는 서비스 함수 (프로필 이미지 포함)
export const saveUserToDatabase = async (user_id, user_pwd, user_nickname, email, user_gender, profile_img) => {
  try {
    const query = `INSERT INTO tb_user (user_id, user_pwd, user_nickname, email, user_gender, profile_img) VALUES (?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.execute(query, [user_id, user_pwd, user_nickname, email, user_gender, profile_img]);

    return result.affectedRows > 0;  // ✅ 성공적으로 저장되면 true 반환
  } catch (error) {
    console.error('❌ DB 저장 오류:', error);
    return false;
  }
};

// ✅ 특정 유저의 프로필 이미지 가져오기
export const getUserProfileImage = async (user_id) => {
  try {
    const [rows] = await pool.execute("SELECT profile_img FROM tb_user WHERE user_id = ?", [user_id]);
    return rows.length ? rows[0].profile_img : null;
  } catch (error) {
    console.error("❌ 프로필 이미지 조회 오류:", error);
    return null;
  }
};

// ✅ 유저의 프로필 이미지 업데이트
export const updateUserProfileImage = async (user_id, profile_img) => {
  try {
    await pool.execute("UPDATE tb_user SET profile_img = ? WHERE user_id = ?", [profile_img, user_id]);
    return true;
  } catch (error) {
    console.error("❌ 프로필 이미지 업데이트 오류:", error);
    return false;
  }
};