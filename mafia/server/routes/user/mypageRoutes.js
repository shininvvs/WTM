import express from 'express';
import { getUserProfile, deactivateUser, changePassword, updateProfileImage, deleteProfileImage, changeNickname } from '../../controllers/user/mypageController.js';
import multer from 'multer';

const upload = multer({ dest: "uploads/profile_images" });

const router = express.Router();

router.get('/user/:user_id', getUserProfile); // 마이페이지 조회
router.put('/user/deactivate', deactivateUser); // 회원 탈퇴
router.put('/user/change-password', changePassword); // 비밀번호 변경

// ✅ 프로필 이미지 업데이트
router.put('/user/update-profile-img', upload.single("profile_img"), updateProfileImage);

// ✅ 프로필 이미지 삭제
router.delete('/user/delete-profile-img', deleteProfileImage);

// ✅ 닉네임 변경
router.put('/user/change-nickname', changeNickname);

export default router;
