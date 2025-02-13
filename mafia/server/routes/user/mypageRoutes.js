import express from 'express';
import { getUserProfile, deactivateUser, changePassword } from '../../controllers/user/mypageController.js';

const router = express.Router();

router.get('/user/:user_id', getUserProfile); // 마이페이지 조회
router.put('/user/deactivate', deactivateUser); // 회원 탈퇴
router.put('/user/change-password', changePassword); // 비밀번호 변경

export default router;
