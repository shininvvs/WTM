import express from 'express';
import { exitRoom } from '../../controllers/lobby/exitRoomController.js';

const router = express.Router();

// 방 나가기
router.use('/:roomId', exitRoom);

export default router;
