import express from 'express';
import { startGame } from '../../controllers/mafiaGame/startGameController.js';  // named import

const router = express.Router();

// 방 접속 라우터
router.post('/:roomId', startGame);

export default router;  // default export
