// 방 접속할 때 접속인원 증가시키기 위한 라우터
import express from 'express';
import { updateCurrentUserController } from '../../controllers/lobby/updateCurrentUserController.js';  // named import

const router = express.Router();

// 방 접속 라우터
router.post('/:roomId', updateCurrentUserController);

export default router;  // default export
