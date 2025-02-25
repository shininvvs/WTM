import pool from '../../config/database.js';

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
