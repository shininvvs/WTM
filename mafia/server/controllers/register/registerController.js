import { checkUserIdService, checkUserNicknameService, checkUserEmailService, saveUserToDatabase } from '../../services/register/registerService.js';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';

// ✅ Multer 설정 (파일 업로드 미들웨어)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// ✅ 아이디 중복 체크 API (GET)
export const checkUserId = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ success: false, message: '❌ 아이디를 입력하세요.' });
    }

    const isDuplicate = await checkUserIdService(user_id);
    return res.status(200).json({ success: !isDuplicate, message: isDuplicate ? '❌ 이미 사용 중인 아이디입니다.' : '✅ 사용 가능한 아이디입니다.' });
  } catch (error) {
    console.error('❌ 아이디 중복 확인 오류:', error);
    return res.status(500).json({ success: false, message: '❌ 서버 오류 발생' });
  }
};

// ✅ 닉네임 중복 체크 API (GET)
export const checkUserNickname = async (req, res) => {
  try {
    const { user_nickname } = req.query;
    if (!user_nickname) {
      return res.status(400).json({ success: false, message: '❌ 닉네임을 입력하세요.' });
    }

    const isDuplicate = await checkUserNicknameService(user_nickname);
    return res.status(200).json({ success: !isDuplicate, message: isDuplicate ? '❌ 이미 사용 중인 닉네임입니다.' : '✅ 사용 가능한 닉네임입니다.' });
  } catch (error) {
    console.error('❌ 닉네임 중복 확인 오류:', error);
    return res.status(500).json({ success: false, message: '❌ 서버 오류 발생' });
  }
};

// ✅ 이메일 중복 체크 API (GET)
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: '❌ 이메일을 입력하세요.' });
    }

    const isDuplicate = await checkUserEmailService(email);
    return res.status(200).json({ success: !isDuplicate, message: isDuplicate ? '❌ 이미 등록된 이메일입니다.' : '✅ 사용 가능한 이메일입니다.' });
  } catch (error) {
    console.error('❌ 이메일 중복 확인 오류:', error);
    return res.status(500).json({ success: false, message: '❌ 서버 오류 발생' });
  }
};

// ✅ 회원가입 API (POST) + 프로필 이미지 업로드
// ✅ 회원가입 API (POST)
export const register = async (req, res) => {
  try {
    console.log("✅ 회원가입 요청 도착!");
    console.log("👉 req.body:", req.body);
    console.log("👉 req.file:", req.file);

    const { user_id, user_pwd, user_nickname, email, user_gender } = req.body;
    if (!user_id || !user_pwd || !user_nickname || !email || !user_gender) {
      return res.status(400).json({ success: false, message: "❌ 모든 필드를 입력하세요." });
    }

    // ✅ 중복 체크 개별 처리
    const isDuplicateId = await checkUserIdService(user_id);
    const isDuplicateNickname = await checkUserNicknameService(user_nickname);
    const isDuplicateEmail = await checkUserEmailService(email);

    if (isDuplicateId) {
      return res.status(400).json({ success: false, field: "user_id", message: "❌ 이미 사용 중인 아이디입니다." });
    }
    if (isDuplicateNickname) {
      return res.status(400).json({ success: false, field: "user_nickname", message: "❌ 이미 사용 중인 닉네임입니다." });
    }
    if (isDuplicateEmail) {
      return res.status(400).json({ success: false, field: "email", message: "❌ 이미 등록된 이메일입니다." });
    }

    // ✅ 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(user_pwd, 10);

    // ✅ 프로필 이미지 기본값 설정
    let profileImg = "/uploads/profile_images/profile_default/default_m.png";
    if (user_gender === "female") {
      profileImg = "/uploads/profile_images/profile_default/default_f.png";
    }
    if (req.file) {
      profileImg = `/uploads/profile_images/${req.file.filename}`;
    }

    // ✅ DB 저장
    const saveResult = await saveUserToDatabase(user_id, hashedPassword, user_nickname, email, user_gender, profileImg);
    if (!saveResult) {
      return res.status(500).json({ success: false, message: "❌ 회원가입 실패" });
    }

    return res.status(201).json({ success: true, message: "✅ 회원가입 성공!" });
  } catch (error) {
    console.error("❌ 회원가입 오류:", error);
    return res.status(500).json({ success: false, message: "❌ 서버 오류 발생" });
  }
};

