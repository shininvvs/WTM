
import { fetchUsers , updateUserStatusService } 
    from '../../services/admin/userManagementService.js';

// 유저 목록 조회
export const getUsers = async (req, res) => {
    console.log("✅ /users 라우터 요청 도착!"); // 디버깅 로그 추가
    try {
        const userList  = await fetchUsers();
        console.log("조회된 데이터:", userList); // 디버깅: 데이터 출력
        res.json({ success: true, data: userList });
    } catch (err) {
        console.error("DB 오류:", err);
        res.status(500).json({ success: false, message: '회원 데이터를 불러오는 중 오류가 발생했습니다.' });
    }
};

// 유저 상태 변경
export const updateUserStatus = async (req, res) => {
    const { user_id } = req.params;
    const { user_status } = req.body;

    console.log("✅ 상태 업데이트 요청:", req.body);

    try {
        const result = await updateUserStatusService(user_id, user_status);
        if (result) {
            res.json({ success: true, message: '상태가 업데이트되었습니다.' });
        } else {
            res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
        }
    } catch (err) {
        console.error("🚨 상태 업데이트 중 오류 발생:", err);
        res.status(500).json({ success: false, message: '상태 업데이트 중 오류가 발생했습니다.' });
    }
};