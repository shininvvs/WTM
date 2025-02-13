const db = require("../config/database");

function getRoomById(roomId, callback) {
  const query = "SELECT * FROM ROOMS WHERE room_id = ?";
  db.query(query, [roomId], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0] || null);
  });
}

module.exports = { getRoomById };
