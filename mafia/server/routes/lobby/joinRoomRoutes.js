import express from 'express';
import { joinRoom } from '../../controllers/lobby/joinRoomController.js';  // named import

const router = express.Router();

// 방 접속 라우터
router.get('/:roomId', joinRoom);

export default router;  // default export
