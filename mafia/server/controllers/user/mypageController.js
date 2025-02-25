import pool from '../../config/database.js';
import bcrypt from 'bcrypt';

// ✅ 마이페이지 조회
export const getUserProfile = async (req, res) => {
  const { user_id } = req.params;

  try {
    const [rows] = await pool.execute(`
      SELECT user_id, user_nickname, total_games, wins, loses, enroll_date, profile_img, user_gender
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

// ✅ 닉네임 변경
export const changeNickname = async (req, res) => {
  const { user_id, new_nickname } = req.body;

  try {
    // 닉네임 중복 체크
    const [existing] = await pool.execute("SELECT user_id FROM tb_user WHERE user_nickname = ?", [new_nickname]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: "❌ 현재 사용 중인 닉네임입니다." });
    }

    const [result] = await pool.execute(
      "UPDATE tb_user SET user_nickname = ? WHERE user_id = ?",
      [new_nickname, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "❌ 닉네임 변경 실패" });
    }

    return res.status(200).json({ success: true, message: "✅ 닉네임이 변경되었습니다." });
  } catch (error) {
    console.error("닉네임 변경 오류:", error);
    return res.status(500).json({ success: false, message: "❌ 서버 오류 발생" });
  }
};

// ✅ 프로필 이미지 업데이트
export const updateProfileImage = async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!req.file) {
      return res.status(400).json({ success: false, message: "❌ 업로드된 이미지가 없습니다." });
    }

    const profileImg = `/uploads/profile_images/users/${req.file.filename}`;
    await pool.execute("UPDATE tb_user SET profile_img = ? WHERE user_id = ?", [profileImg, user_id]);

    return res.status(200).json({ success: true, message: "✅ 프로필 이미지가 변경되었습니다.", profile_img: profileImg });
  } catch (error) {
    console.error("프로필 이미지 업데이트 오류:", error);
    return res.status(500).json({ success: false, message: "❌ 서버 오류 발생" });
  }
};

// ✅ 프로필 이미지 삭제
export const deleteProfileImage = async (req, res) => {
  try {
    const { user_id } = req.body;
    const defaultImg = "/uploads/profile_images/profile_default/default.png";
    await pool.execute("UPDATE tb_user SET profile_img = ? WHERE user_id = ?", [defaultImg, user_id]);

    return res.status(200).json({ success: true, message: "✅ 프로필 이미지가 삭제되었습니다.", profile_img: defaultImg });
  } catch (error) {
    console.error("프로필 이미지 삭제 오류:", error);
    return res.status(500).json({ success: false, message: "❌ 서버 오류 발생" });
  }
};
