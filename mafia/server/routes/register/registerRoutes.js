import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { checkUserId, checkUserNickname, checkEmail, register } from "../../controllers/register/registerController.js";

// ✅ 업로드 폴더 설정
const uploadDir = "uploads/profile_images";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

const router = express.Router();

// ✅ 아이디 중복 체크 API
router.get("/check-id", checkUserId);

// ✅ 닉네임 중복 체크 API
router.get("/check-nickname", checkUserNickname);

// ✅ 이메일 중복 확인 추가
router.get("/check-email", checkEmail);

// ✅ 회원가입 API (파일 업로드 미들웨어 적용)
router.post("/", upload.single("profile_img"), register);

export default router;
