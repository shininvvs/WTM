import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Admin.css";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        // API 호출
        // 회원 리스트를 서버에서 가져오기
        const fetchUsers = async () => {
          try {
            const response = 
              await axios.get(`http://localhost:3000/users`);
            console.log("✅ 응답 데이터:", response.data); // 백엔드에서 온 응답 확인
            if (response.data.success) {
              setUsers(response.data.data); // 데이터 설정
            } else {
              setError(response.data.message);
            }
          } catch (err) {
            console.error("❌ 요청 오류:", err);
            setError("데이터를 불러오는 중 오류가 발생했습니다.");
          }
        };
        fetchUsers();
    }, []);

    // 상태 변경 함수
    const handleStatusChange = async (user_id, currentStatus) => {
        const newStatus = currentStatus === "y" ? "n" : "y";
        const confirmMessage = currentStatus === "y" 
        ? "비활성화하시겠습니까?" 
        : "활성화하시겠습니까?";

        if (window.confirm(confirmMessage)) {
            try {
                const response = 
                  await axios.put(`http://localhost:3000/users/${user_id}/status`, {
                user_status: newStatus,
                }, {
                    headers: {
                      "Content-Type": "application/json",
                    },
                });
                if (response.data.success) {
                // 상태 업데이트 후 리스트 갱신
                setUsers((prevUsers) =>
                    prevUsers.map((user) =>
                    user.user_id === user_id ? { ...user, user_status: newStatus } : user
                    )
                );
                alert("상태가 성공적으로 업데이트되었습니다.");
                } else {
                  alert(response.data.message);
                }
            } catch (err) {
                console.error(err);
                alert("상태 업데이트 중 오류가 발생했습니다.");
            }
        }
    };

  return (
    <div className="login-container">
      <h1 className="login-title">회원관리</h1>
      어떤 컬럼들을 더 조회할지 논의 해볼것? <br />
      {error ? (<p className="error-message">{error}</p>) : (
        <table className="user-list-table">
        <thead>
          <tr>
            <th>user_id</th>
            <th>user_nickname</th>
            <th>enroll_date</th>
            <th>user_status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.user_id}>
              <td>{user.user_id}</td>
              <td>{user.user_nickname}</td>
              <td>{user.enroll_date}</td>
              <td><button onClick={() => handleStatusChange(user.user_id, user.user_status)}
                          className={`status-button ${
                            user.user_status === "y" ? "active" : "inactive"
                          }`}>
                    {user.user_status === "y" ? "활성화" : "비활성화"}
                  </button></td>
            </tr>
          ))}
        </tbody>
      </table>
      )}
    </div>
  );
};

export default UserManagement;

