import * as lobbyService from '../../services/lobby/joinRoomService.js';  // named import

const joinRoom = async (req, res) => {
    const { roomId } = req.params;  // URL에서 roomId를 추출
    console.log("요청 받은 roomId:", roomId);

    try {
        // 방 정보를 가져옴
        const room = await lobbyService.getRoomInfo(roomId);

        if (!room) {
            return res.status(404).json({ success: false, message: "방을 찾을 수 없습니다." });
        }

        // 비밀번호 확인 로직 (필요한 경우)
        const { password } = req.body;
        if (room.password && room.password !== password) {
            return res.status(400).json({ success: false, message: "비밀번호가 일치하지 않습니다." });
        }

        // 방 정보 반환 (current_users 증가 X)
        return res.status(200).json({ 
            success: true, 
            room: { 
                room_id: room.room_id,
                room_name: room.room_name,
                current_users: room.current_users
            }
        });
    } catch (error) {
        console.error("방 입장 오류:", error);
        return res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
    }
};

export { joinRoom };
