import express from 'express';
import { joinRoom } from '../../controllers/lobby/joinRoomController.js';  // named import

const router = express.Router();

// 방 접속 라우터
router.get('/:roomId', joinRoom);
console.log('방 접속 라우터 실행됨 !');

export default router;  // default export
