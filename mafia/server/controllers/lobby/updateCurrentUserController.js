// 방 입장시 접속인원 증가시키기 위한 컨트롤러
import * as updateCurrentUserService from '../../services/lobby/updateCurrentUserService.js';


const updateCurrentUserController = async (req, res) => {
    const { roomId } = req.params;  // URL에서 roomId를 추출
    console.log("요청 받은 roomId:", roomId);

    try {
        // 방 정보 가져오기
        const room = await updateCurrentUserService.getJoinRoomInfo(roomId);

        if (!room) {
            return res.status(404).json({ success: false, message: "방을 찾을 수 없습니다." });
        }

        // 비밀번호 확인 로직 (필요한 경우)
        const { password } = req.body;
        if (room.password && room.password !== password) {
            return res.status(400).json({ success: false, message: "비밀번호가 일치하지 않습니다." });
        }

        // 입장 시 current_users 증가
        const updatedRoom = await updateCurrentUserService.incrementRoomUsers(roomId);
        if (!updatedRoom) {
            return res.status(500).json({ success: false, message: "방 입장 처리 중 오류가 발생했습니다." });
        }

        return res.status(200).json({ 
            success: true, 
            room: { 
                room_id: updatedRoom.room_id,
                room_name: updatedRoom.room_name,
                current_users: updatedRoom.current_users
            }
        });
    } catch (error) {
        console.error("방 입장 오류:", error);
        return res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
    }
};

export { updateCurrentUserController };
