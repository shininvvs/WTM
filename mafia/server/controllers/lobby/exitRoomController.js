import { updateRoomAfterExit } from '../../services/lobby/exitRoomService.js';

// 방 나가기 처리
const exitRoom = async (req, res) => {
  const roomId = req.params.roomId;
  console.log('나가기용 roomId:', roomId);

  try {
    const updatedRoom = await updateRoomAfterExit(roomId);

    console.log('나가기용 서비스 갔다옴');

    if (updatedRoom) {
      res.json({ success: true, room: updatedRoom });
    } else {
      res.status(400).json({ success: false, message: "방 정보를 업데이트할 수 없습니다." });
    }
  } catch (error) {
    console.error("방 나가기 처리 중 오류:", error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};

export { exitRoom };
