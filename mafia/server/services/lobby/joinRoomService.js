import db from '../../config/database.js';  // MySQL 데이터베이스 연결

// 방 정보 조회 (current_users 증가 X)
const getRoomInfo = async (roomId) => {
  try {
    const query = 'SELECT * FROM rooms WHERE room_id = ?';  // 방 정보 조회
    const [room] = await db.execute(query, [roomId]);

    if (room.length === 0) {
      return null;  // 방이 없으면 null 반환
    }

    return room[0];  // 방 정보 반환
  } catch (error) {
    console.error("방 정보 조회 오류:", error);
    throw error;
  }
};

export { getRoomInfo };
