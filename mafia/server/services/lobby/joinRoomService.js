import db from '../../config/database.js';  // MySQL 데이터베이스 연결

// 방 비밀번호 확인 및 입장 시 current_users 업데이트
const checkRoomPassword = async (roomId) => {
  try {
    const query = 'SELECT * FROM rooms WHERE room_id = ?';  // 방 정보 조회
    const [room] = await db.execute(query, [roomId]);

    if (room.length === 0) {
      return null;  // 방이 없으면 null 반환
    }

    // 방의 current_users 값을 1 증가시킴
    const updateQuery = 'UPDATE rooms SET current_users = current_users + 1 WHERE room_id = ?';
    await db.execute(updateQuery, [roomId]);

    // 업데이트 후 새로운 방 정보 반환
    const updatedRoomQuery = 'SELECT * FROM rooms WHERE room_id = ?';
    const [updatedRoom] = await db.execute(updatedRoomQuery, [roomId]);
    
    return updatedRoom[0];  // 최신 정보 반환
  } catch (error) {
    console.error("방 정보 조회 또는 업데이트 오류:", error);
    throw error;
  }
};

export { checkRoomPassword };
