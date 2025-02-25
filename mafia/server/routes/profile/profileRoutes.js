import express from "express";
import { updateProfileImage, deleteProfileImage } from "../../controllers/profile/profileController.js";

const router = express.Router();

// ✅ 프로필 이미지 업데이트
router.put("/update", updateProfileImage);

// ✅ 프로필 이미지 삭제
router.delete("/delete", deleteProfileImage);

export default router;
