import express from 'express';
import { login } from '../../controllers/login/loginController.js'; // ✅ 로그인 컨트롤러 가져오기

const router = express.Router();

router.post('/', login); // ✅ POST 요청으로 로그인 처리

export default router;