// server/controller/lobby/lobbyController.js
import * as lobbyService from "../../services/lobby/lobbyService.js";  // named import

const getLobbyRooms = async (req, res) => {
  console.log("getLobbyRooms 함수 호출됨");
  try {
    const rooms = await lobbyService.getRooms();
    //console.log("방 목록:", rooms);  // 방 목록 확인
    res.json(rooms);
  } catch (err) {
    console.error("서버 오류:", err.message);  // 서버에서 발생한 오류를 콘솔에 출력
    res.status(500).send("방 목록을 가져오는 데 실패했습니다.");
  }
};

export { getLobbyRooms };  // named export
