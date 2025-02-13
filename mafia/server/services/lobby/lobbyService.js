// server/service/lobby/lobbyService.js
import db from "../../config/database.js";  // MySQL 데이터베이스 연결

const getRooms = async () => {
  try {
    const query = "SELECT room_id, room_name, room_pwd, current_users FROM ROOMS";
    //console.log("방목록 쿼리문 : ", query);
    const [rows] = await db.query(query);
    return rows;
  } catch (err) {
    throw new Error("방 목록 가져오기 실패: " + err.message);
  }
};

export { getRooms };  // named export
