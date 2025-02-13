import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/user/mypage.css";

const MyPage = () => {
  const user_id = localStorage.getItem("user_id");
  const navigate = useNavigate();
  
  const [user, setUser] = useState({});
  const [newPassword, setNewPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get(`http://localhost:3000/mypage/user/${user_id}`)
      .then(res => {
        if (res.data.success) {
          setUser(res.data.user);
        }
      })
      .catch(err => console.error(err));
  }, [user_id]);

  // ✅ 가입일 변환 함수
  const formatDate = (dateString) => {
    if (!dateString) return "정보 없음";  // 값이 없으면 기본값 표시
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];  // "YYYY-MM-DD" 형식으로 변환
  };

  // 회원탈퇴
  const deactivateUser = () => {
    if (window.confirm("정말 회원 탈퇴하시겠습니까?")) {
      axios.put("http://localhost:3000/mypage/user/deactivate", { user_id })
        .then(() => {
          alert('그동안 이용해주셔서 고맙습니다.');
          localStorage.clear();
          navigate("/");
        })
        .catch(err => console.error(err));
    }
  };

  const handleChangePassword = () => {
    axios.put("http://localhost:3000/mypage/user/change-password", { 
        user_id, 
        old_password: oldPassword, 
        new_password: newPassword 
      })
      .then(res => {
        setMessage(res.data.message);
        
        if (res.data.success) {
          alert("비밀번호가 변경되었습니다. 다시 로그인해주세요.");
          localStorage.clear();
          navigate("/");
        }
      })
      .catch(err => setMessage(err.response?.data?.message || "❌ 오류 발생"));
  };

  const back = () => {
    navigate("/lobby");
  };

  return (
    <div className="mypage-container">
      <button className="back-button" onClick={back}>뒤로가기</button>
      <h2 className="mypage-title">마이페이지</h2>
      
      <div className="mypage-info">
        <p><strong>닉네임:</strong> <span className="user-data">{user.user_nickname}</span></p>
        <p><strong>총 게임 수:</strong> <span className="user-data">{user.total_games}</span></p>
        <p><strong>승리:</strong> <span className="user-data">{user.wins}</span></p>
        <p><strong>패배:</strong> <span className="user-data">{user.loses}</span></p>
        <p><strong>승률:</strong> <span className="user-data">{user.winRate}%</span></p>
        <p><strong>가입일:</strong> <span className="user-data">{formatDate(user.enroll_date)}</span></p> {/* ✅ 가입일 변환 적용 */}
      </div>

      <h3 className="password-change-title">비밀번호 변경</h3>
      <input className="input-field" type="password" placeholder="현재 비밀번호" onChange={(e) => setOldPassword(e.target.value)} />
      <input className="input-field" type="password" placeholder="새 비밀번호" onChange={(e) => setNewPassword(e.target.value)} />
      <button className="update-button" onClick={handleChangePassword}>변경</button>
      <p className={message.includes("❌") ? "error-message" : "success-message"}>{message}</p>

      <button className="delete-button" onClick={deactivateUser}>회원 탈퇴</button>
    </div>
  );
};

export default MyPage;
