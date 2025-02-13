import express from 'express';
import { createRoom } from '../../controllers/lobby/createRoomController.js';

const router = express.Router();

// 방 생성 요청을 처리하는 라우터
router.post('/', createRoom);
/*
router.post("/", (req, res, next) => {
  console.log("✅ 방 생성 요청이 들어왔습니다."); // 요청이 올 때만 실행
  createRoom(req, res, next);
});
*/
export default router;
