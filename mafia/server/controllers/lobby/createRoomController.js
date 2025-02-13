import { createRoom as createRoomService } from '../../services/lobby/createRoomService.js'; // 이름 변경

// 방 생성 요청을 처리하는 컨트롤러 함수
const createRoom = async (req, res) => {
  try {
    const { roomName, password } = req.body;

    // 방 생성 로직
    const newRoom = await createRoomService(roomName, password); // roomService -> createRoomService로 수정

    console.log("방생성 컨트롤러 : ", newRoom);

    if (newRoom) {
      return res.status(200).json({ success: true, room: newRoom });
    } else {
      return res.status(400).json({ success: false, message: "방 생성에 실패했습니다." });
    }
  } catch (err) {
    console.error("방 생성 에러:", err);
    return res.status(500).json({ success: false, message: "서버 에러" });
  }
};

export { createRoom };
