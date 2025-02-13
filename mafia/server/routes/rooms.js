const express = require("express");
const db = require("../config/database");
const { getRoomById } = require("../utils/helpers");

const router = express.Router();

// 방 목록 조회
router.get("/lobby", (req, res) => {
  const query =
    "SELECT room_id, room_name, room_pwd, current_users FROM ROOMS";
  db.query(query, (err, results) => {
    if (err) {
      console.error("방 목록 가져오기 실패:", err);
      return res.status(500).send("Error fetching rooms");
    }
    res.render("index", { rooms: results });
  });
});

// 방 생성
router.post("/create-room", (req, res) => {
  const { room_name, room_pwd } = req.body;

  const query = "INSERT INTO ROOMS (room_name, room_pwd) VALUES (?, ?)";
  db.query(query, [room_name, room_pwd], (err, result) => {
    if (err) {
      console.error("방 생성 실패:", err);
      return res.status(500).send("Error creating room");
    }

    const roomId = result.insertId;
    res.status(200).json({ roomId });
  });
});

// 비밀번호 확인
router.post("/check-password", (req, res) => {
  const { room_id, password } = req.body;

  getRoomById(room_id, (err, room) => {
    if (err) {
      console.error("방 조회 실패:", err);
      return res.status(500).json({ isValid: false });
    }

    if (room && room.room_pwd === password) {
      const query =
        "UPDATE ROOMS SET current_users = current_users + 1 WHERE room_id = ?";
      db.query(query, [room_id], (updateErr) => {
        if (updateErr) {
          console.error("접속자 수 업데이트 실패:", updateErr);
          return res.status(500).json({ message: "접속자 수 업데이트 실패" });
        }
        res.json({ isValid: true });
      });
    } else {
      res.json({ isValid: false });
    }
  });
});

// 방 나가기
router.post("/leave-room", (req, res) => {
  const { room_id } = req.body;

  const query =
    "UPDATE ROOMS SET current_users = current_users - 1 WHERE room_id = ?";
  db.query(query, [room_id], (err, result) => {
    if (err) {
      console.error("접속자 수 감소 실패:", err);
      return res.status(500).json({ success: false });
    }
    if (result.affectedRows === 0) {
      return res.status(400).json({ success: false });
    }
    res.json({ success: true });
  });
});

// 방 정보 페이지
router.get("/room/:roomId", (req, res) => {
  const { roomId } = req.params;

  const query = "SELECT * FROM ROOMS WHERE room_id = ?";
  db.query(query, [roomId], (err, results) => {
    if (err) {
      console.error("방 정보 조회 실패:", err);
      return res.status(500).send("Error retrieving room information");
    }
    if (results.length > 0) {
      res.render("room", { room: results[0] });
    } else {
      res.status(404).send("Room not found");
    }
  });
});

module.exports = router;
