import db from "../../config/database.js";
import bcrypt from "bcrypt";
import { sendEmail } from "../../services/user/emailService.js";

// 🔹 아이디 찾기
export const findID = async (req, res) => {
  const { email } = req.body;

  try {
    const [user] = await db.query("SELECT user_id FROM tb_user WHERE email = ?", [email]);

    if (!user.length) {
      return res.status(404).json({ message: "❌ 등록된 이메일이 없습니다." });
    }

    return res.json({ success: true, user_id: user[0].user_id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류 발생" });
  }
};

// 🔹 비밀번호 재설정 요청
export const requestResetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const [user] = await db.query("SELECT user_id FROM tb_user WHERE email = ?", [email]);

    if (!user.length) {
      return res.status(404).json({ message: "❌ 등록된 이메일이 없습니다." });
    }

    const resetToken = Math.random().toString(36).substr(2, 8);
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await db.query("UPDATE tb_user SET reset_token = ?, reset_token_expiry = ? WHERE email = ?", 
      [resetToken, resetTokenExpiry, email]);

    const emailSent = await sendEmail(email, "비밀번호 재설정 요청", `인증 코드: ${resetToken}`);

    if (emailSent) {
      return res.json({ success: true, message: "📧 이메일로 인증 코드가 발송되었습니다." });
    } else {
      return res.status(500).json({ message: "❌ 이메일 전송 실패" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류 발생" });
  }
};

// 🔹 비밀번호 변경
export const resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;

  try {
    // ✅ 해당 이메일의 사용자 조회
    const [user] = await db.query("SELECT reset_token, reset_token_expiry FROM tb_user WHERE email = ?", [email]);

    if (!user.length) {
      return res.status(400).json({ message: "❌ 이메일을 찾을 수 없습니다." });
    }

    // ✅ 토큰 검증
    const storedToken = user[0].reset_token;
    const tokenExpiry = user[0].reset_token_expiry;

    if (!storedToken || storedToken !== token || new Date(tokenExpiry) < new Date()) {
      return res.status(400).json({ message: "❌ 유효하지 않거나 만료된 인증 코드입니다." });
    }

    // ✅ 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ✅ 비밀번호 업데이트 및 인증 코드 제거
    await db.query("UPDATE tb_user SET user_pwd = ?, reset_token = NULL, reset_token_expiry = NULL WHERE email = ?", 
      [hashedPassword, email]);

    return res.json({ success: true, message: "✅ 비밀번호가 성공적으로 변경되었습니다!" });
  } catch (error) {
    console.error("❌ [비밀번호 변경 오류]:", error);
    return res.status(500).json({ message: "서버 오류 발생" });
  }
};

