import db from '../../config/database.js';  // MySQL 데이터베이스 연결

// 게임 상태를 'y'로 업데이트하는 서비스 로직
const updateGameState = async (roomId) => {
  try {
    const updateQuery = 'UPDATE rooms SET current_state = "y" WHERE room_id = ? and current_state = "n"';
    await db.execute(updateQuery, [roomId]);

    // 업데이트된 방 정보 조회 후 반환
    const updatedRoomQuery = 'SELECT * FROM rooms WHERE room_id = ?';
    const [updatedRoom] = await db.execute(updatedRoomQuery, [roomId]);

    if (updatedRoom.length === 0) {
        return null;
    }
    return updatedRoom[0];

  } catch (error) {
    console.error('Error updating game state:', error);
    throw error; // 에러를 컨트롤러로 전달
  }
};

export {updateGameState};
