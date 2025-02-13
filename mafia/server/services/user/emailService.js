import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * 이메일 전송 함수
 * @param {string} to - 받는 사람 이메일
 * @param {string} subject - 이메일 제목
 * @param {string} text - 이메일 본문
 */
export const sendEmail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 이메일 전송 성공: ${to}`);
    return true;
  } catch (error) {
    console.error(`❌ 이메일 전송 실패: ${error.message}`);
    return false;
  }
};
