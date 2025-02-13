import express from 'express';
// 컨트롤러 가져오기
import { getUsers, updateUserStatus } 
    from '../../controllers/admin/userManagementController.js';

const router = express.Router();

// 회원 리스트 조회 API
router.get('/', getUsers);
// 유저 상태 변경 API
router.put('/:user_id/status', updateUserStatus);

export default router;
