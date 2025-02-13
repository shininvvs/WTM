// server/routes/lobby/lobbyRoutes.js
import express from 'express';
import { getLobbyRooms } from '../../controllers/lobby/lobbyController.js';  // named import

const router = express.Router();

// /lobby 경로로 요청이 들어오면 getLobbyRooms 실행
router.get("/", getLobbyRooms);

export default router;  // default export
