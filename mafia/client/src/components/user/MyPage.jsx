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
  const [newNickname, setNewNickname] = useState("");
  const [message, setMessage] = useState("");
  const [profileImg, setProfileImg] = useState("");
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // 프로필 이미지 가져오기
  useEffect(() => {
    axios.get(`http://localhost:3000/mypage/user/${user_id}`)
      .then(res => {
        if (res.data.success) {
          setUser(res.data.user);

          const defaultImg = res.data.user.user_gender === "female" 
            ? "http://localhost:3000/uploads/profile_images/profile_default/default_f.png"
            : "http://localhost:3000/uploads/profile_images/profile_default/default_m.png";

          const profileImagePath = res.data.user.profile_img;
          const profileImageUrl = profileImagePath
            ? profileImagePath.startsWith("/uploads")
              ? `http://localhost:3000${profileImagePath}`
              : `http://localhost:3000/uploads/profile_images/users/${profileImagePath}`
            : defaultImg;

          const finalUrl = `${profileImageUrl}?t=${new Date().getTime()}`;
          setProfileImg(finalUrl);
        }
      })
      .catch(err => console.error(err));
  }, [user_id]);

  // 가입일 변환 함수
  const formatDate = (dateString) => {
    if (!dateString) return "정보 없음";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // 파일 선택은 프로필 이미지를 클릭하면 열리도록 label로 연결
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setSelectedFile(file);
    }
  };

  // 선택한 파일을 서버에 업로드하여 프로필 이미지 변경
  const handleConfirmProfileImageChange = () => {
    if (!selectedFile) {
      setMessage("파일을 선택해 주세요.");
      return;
    }
    const formData = new FormData();
    formData.append("user_id", user_id);
    formData.append("profile_img", selectedFile);

    axios.put("http://localhost:3000/mypage/user/update-profile-img", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
    .then(res => {
      setMessage(res.data.message);
      if (res.data.success) {
        setProfileImg(`http://localhost:3000/uploads/profile_images/users/${res.data.profile_img}?t=${new Date().getTime()}`);
        setPreview(null);
        setSelectedFile(null);
      }
    })
    .catch(err => setMessage(err.response?.data?.message || "❌ 프로필 이미지 변경 실패"));
  };

  // 프로필 이미지 삭제
  const handleRemoveProfileImage = () => {
    axios.delete("http://localhost:3000/mypage/user/delete-profile-img", { data: { user_id } })
      .then(res => {
        setMessage(res.data.message);
        if (res.data.success) {
          const defaultImg = user.user_gender === "female" 
            ? "http://localhost:3000/uploads/profile_images/profile_default/default_f.png"
            : "http://localhost:3000/uploads/profile_images/profile_default/default_m.png";
          setProfileImg(defaultImg);
        }
      })
      .catch(err => setMessage(err.response?.data?.message || "❌ 프로필 이미지 삭제 실패"));
  };

  // 비밀번호 변경 요청
  const handleChangePassword = () => {
    if (!oldPassword || !newPassword) {
      return setMessage("❌ 기존 비밀번호와 새 비밀번호를 입력하세요.");
    }
    axios.put("http://localhost:3000/mypage/user/change-password", {
      user_id,
      old_password: oldPassword,
      new_password: newPassword
    })
    .then(res => {
      setMessage(res.data.message);
      if (res.data.success) {
        setOldPassword("");
        setNewPassword("");
      }
    })
    .catch(err => setMessage(err.response?.data?.message || "❌ 비밀번호 변경 실패"));
  };

  // 닉네임 변경 요청
  const handleChangeNickname = () => {
    if (!newNickname) {
      return setMessage("❌ 새 닉네임을 입력하세요.");
    }
    axios.put("http://localhost:3000/mypage/user/change-nickname", {
      user_id,
      new_nickname: newNickname
    })
    .then(res => {
      setMessage(res.data.message);
      if (res.data.success) {
        setUser({ ...user, user_nickname: newNickname });
        setNewNickname("");
      }
    })
    .catch(err => setMessage(err.response?.data?.message || "❌ 닉네임 변경 실패"));
  };

  return (
    <div className="mypage-container">
      <button className="back-button" onClick={() => navigate("/lobby")}>뒤로가기</button>
      <h2 className="mypage-title">마이페이지</h2>
      
      <div className="mypage-info">
        {/* 프로필 이미지를 클릭하면 파일 선택창이 열리도록 label로 연결 */}
        <label htmlFor="profile-img-input">
          <img src={preview || profileImg} alt="프로필" className="profile-img" />
        </label>
        <input 
          id="profile-img-input"
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
          style={{ display: "none" }} 
        />
        {/* 파일 선택 후 미리보기가 있다면 "프로필 이미지 저장" 버튼 표시 */}
        {preview && (
          <button onClick={handleConfirmProfileImageChange} className="confirm-img-button">
            프로필 이미지 저장
          </button>
        )}
        <button onClick={handleRemoveProfileImage} className="remove-img-button">
          프로필 이미지 삭제
        </button>

        <p><strong>닉네임:</strong> <span className="user-data">{user.user_nickname}</span></p>
        <input 
          type="text" 
          placeholder="새 닉네임 입력" 
          value={newNickname} 
          onChange={(e) => setNewNickname(e.target.value)} 
        />
        <button onClick={handleChangeNickname}>닉네임 변경</button>

        <p><strong>가입일:</strong> <span className="user-data">{formatDate(user.enroll_date)}</span></p>

        <p><strong>총 게임 수:</strong> <span className="user-data">{user.total_games || 0}판</span></p>
        <p><strong>승리 수:</strong> <span className="user-data">{user.wins || 0}승</span></p>
        <p><strong>패배 수:</strong> <span className="user-data">{user.loses || 0}패</span></p>
        <p><strong>승률:</strong> <span className="user-data">{user.winRate || "0.00"}%</span></p>

        <div className="password-change-section">
          <input 
            type="password" 
            placeholder="기존 비밀번호 입력" 
            value={oldPassword} 
            onChange={(e) => setOldPassword(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="새 비밀번호 입력" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
          />
          <button onClick={handleChangePassword}>비밀번호 변경</button>
        </div>
      </div>

      <p className={message.includes("❌") ? "error-message" : "success-message"}>
        {message}
      </p>
    </div>
  );
};

export default MyPage;
