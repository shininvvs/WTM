import db from "../../config/database.js"; // MySQL 데이터베이스 연결

const createRoom = async (roomName, password) => {
  if (!roomName) {
    throw new Error("방 이름이 필요합니다.");
  }
  if (password === undefined) {
    password = null; // 비밀번호가 전달되지 않으면 null로 설정
  }

  try {
    const query = "INSERT INTO ROOMS (room_name, room_pwd) VALUES (?, ?)";
    console.log("🟢 방 생성 쿼리문 실행:", query);
    console.log("쿼리 실행 준비:", [roomName, password]);

    const values = [roomName, password];

    // db.query를 Promise로 감싸지 않고 pool.execute 사용
    const [results] = await db.execute(query, values);

    console.log("✅ 방 생성 성공 - DB 저장 완료");
    console.log("🟢 INSERT 결과:", results);

    if (!results || !results.insertId) {
      console.error("❌ 결과 또는 insertId가 없습니다.");
      throw new Error("방 생성 실패 - 결과 없음 또는 insertId 없음");
    }

    const newRoom = {
      room_id: results.insertId,
      room_name: roomName,
      room_pwd: password,
      current_users: 1
    };

    console.log("🟢 방 생성 후 반환 객체:", newRoom);
    return newRoom;

  } catch (err) {
    console.error("❌ 방 생성 중 오류 발생:", err);
    throw new Error("방 생성 실패: " + err.message);
  }
};

export { createRoom };
