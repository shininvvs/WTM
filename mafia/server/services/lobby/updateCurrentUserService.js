// 방 입장시 접속인원 증가시키기 위한 서비스
import db from '../../config/database.js';  // MySQL 데이터베이스 연결

// 방 정보 조회
const getJoinRoomInfo = async (roomId) => {
    try {
        const query = 'SELECT * FROM rooms WHERE room_id = ?';  // 방 정보 조회
        const [room] = await db.execute(query, [roomId]);

        if (room.length === 0) {
            return null;  // 방이 없으면 null 반환
        }

        return room[0];  // 기존 방 정보 반환
    } catch (error) {
        console.error("방 정보 조회 오류:", error);
        throw error;
    }
};

// 방에 입장 시 current_users 증가
const incrementRoomUsers = async (roomId) => {
    try {
        const updateQuery = 'UPDATE rooms SET current_users = current_users + 1 WHERE room_id = ?';
        await db.execute(updateQuery, [roomId]);

        // 업데이트된 방 정보 조회 후 반환
        const updatedRoomQuery = 'SELECT * FROM rooms WHERE room_id = ?';
        const [updatedRoom] = await db.execute(updatedRoomQuery, [roomId]);

        if (updatedRoom.length === 0) {
            return null;
        }

        return updatedRoom[0];
    } catch (error) {
        console.error("방 인원 증가 오류:", error);
        throw error;
    }
};

export { getJoinRoomInfo, incrementRoomUsers };
