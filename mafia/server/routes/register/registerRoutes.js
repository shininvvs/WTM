import express from 'express';
import { checkUserId, checkUserNickname, checkEmail, register } from '../../controllers/register/registerController.js';

const router = express.Router(); 

// ✅ 아이디 중복 체크 API
router.get('/check-id', checkUserId);  

// ✅ 닉네임 중복 체크 API
router.get('/check-nickname', checkUserNickname);

// ✅ 이메일 중복 확인 추가
router.get("/check-email", checkEmail);  

// ✅ 회원가입 API
router.post('/', register); 

export default router;
