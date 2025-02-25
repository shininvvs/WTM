import db from "../../config/database.js"; // MySQL 데이터베이스 연결

// 방에서 나갈 때 current_users 감소
const updateRoomAfterExit = async (roomId) => {
  const connection = await db.getConnection();  // DB 연결

  console.log('나가기용 서비스 들어옴');
  try {
    await connection.beginTransaction();  // 트랜잭션 시작

    // 방의 current_users 값을 1 감소시킴
    const updateQuery = 'UPDATE rooms SET current_users = current_users - 1 WHERE room_id = ?';
    const [result] = await connection.execute(updateQuery, [roomId]);

    if (result.affectedRows === 0) {
      throw new Error("방 정보 업데이트 실패");
    }

    // 업데이트 후 새로운 방 정보 반환
    const updatedRoomQuery = 'SELECT * FROM rooms WHERE room_id = ?';
    const [updatedRoom] = await connection.execute(updatedRoomQuery, [roomId]);

    await connection.commit();  // 트랜잭션 커밋

    return updatedRoom[0];  // 최신 방 정보 반환
  } catch (error) {
    await connection.rollback();  // 오류 발생 시 롤백
    console.error("방 정보 업데이트 실패:", error);
    throw error;
  } finally {
    connection.release();  // DB 연결 반환
  }
};

export { updateRoomAfterExit };
