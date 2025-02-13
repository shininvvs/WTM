import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../../styles/lobby/LobbyRoom.css';

const LobbyRoom = () => {
  const [rooms, setRooms] = useState([]);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);  
  const [isPasswordProtected, setIsPasswordProtected] = useState(false); 
  const [roomName, setRoomName] = useState(""); 
  const [password, setPassword] = useState(""); 
  const [selectedRoom, setSelectedRoom] = useState(null);  // 선택된 방 정보
  const [showPasswordModal, setShowPasswordModal] = useState(false);  // 비밀번호 입력 모달
  const navigate = useNavigate();

  // 방 목록 가져오기
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get("http://localhost:3000/lobby");  
        setRooms(res.data);
      } catch (err) {
        console.error("에러", err.message); 
        setMessage("방 목록을 불러오는 데 실패했습니다.");
      }
    };
    fetchRooms();
  }, []);

  // 모달 열기/닫기
  const toggleModal = () => {
    setShowModal(!showModal);
  };

  // 비밀번호 설정 체크박스 토글
  const handlePasswordCheckboxChange = (event) => {
    setIsPasswordProtected(event.target.checked);
  };

  // 방 만들기 처리
  const handleCreateRoom = async (event) => {
    event.preventDefault();
    const newRoom = {
      roomName,
      password: isPasswordProtected ? password : null, 
    };
    console.log("방 생성 요청 데이터:", newRoom);  // 요청 확인
    try {
      const res = await axios.post("http://localhost:3000/createRoom", newRoom);
      console.log("방 생성 응답 데이터:", res.data);  // 응답 확인
      if (res.data.success) {
        const roomId = res.data.room.room_id;
        setShowModal(false);
        console.log("Navigating to:", `/room/${roomId}`); // 콘솔 출력
        navigate(`/room/${roomId}`);
      } else {
        setMessage("방 생성에 실패했습니다.");
      }
    } catch (err) {
      console.error("방 생성 실패:", err);
      setMessage("방 생성 중 오류가 발생했습니다.");
    }
  };

  // 입장 및 비밀번호 처리 함수 (handleJoinRoom + handlePasswordSubmit 합침)
const handleJoinRoom = async (room) => {
  console.log("handleJoinRoom 실행됨", room);
  setSelectedRoom(room);  // 선택된 방 저장
  console.log("선택한 방 : ", room);

  // 비밀번호가 있으면 모달을 열고, 없으면 바로 입장
  if (room.room_pwd) {
    setPassword("");  // 비밀번호 초기화
    setShowPasswordModal(true);  // 비밀번호 모달 열기
  } else {
    navigate(`/room/${room.room_id}`);  // 비밀번호 없이 바로 입장
  }
};

// 로그아웃 : 비밀번호 입력 후 입장 처리 (handlePasswordSubmit을 합친 형태)
const logout = async () => {
  // 🔥 1️⃣ localStorage에서 사용자 정보 삭제
  localStorage.removeItem("user_id");
  localStorage.removeItem("user_nickname");

  // 🔥 2️⃣ 카카오 로그아웃 (REST API 사용 X, SDK만 사용)
  if (window.Kakao && window.Kakao.Auth) {
    window.Kakao.Auth.logout(() => {
      window.location.href = "/"; // 🔹 로그인 페이지로 이동
    });
  } else {
    console.warn("⚠️ Kakao SDK가 초기화되지 않음.");
    window.location.href = "/";
  }
};


// 마이페이지
const mypage = () => {
  window.location.href = "/mypage";  // 🔹 마이페이지 URL로 이동
};


  return (
    <div className="lobby-container">
      <button className="logout-button" onClick={logout}>로그아웃</button>
      <button className="mypage-button" onClick={mypage}>마이페이지</button>
      <h1 className="lobby-title">방 목록</h1>
      {message && <p className="error-message">{message}</p>}
      <ul className="room-list">
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <li key={room.room_id} className="room-item">
              <div className="room-info">
                <strong className="room-name">{room.room_name}</strong>
                <span className="room-users">현재 인원: {room.current_users}</span>
              </div>
              <button
                className="join-button"
                onClick={() => handleJoinRoom(room)}  // 입장 버튼 클릭 시 처리
              >
                입장
                {room.room_pwd && <span className="password-icon"> 🔒</span>} {/* 암호 이모티콘 표시 */}
              </button>
            </li>
          ))
        ) : (
          <p className="no-rooms">현재 참여 가능한 방이 없습니다.</p>
        )}
      </ul>
      <button
        type="button"
        onClick={toggleModal} 
        className="create-room-button"
      >
        방 만들기
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>방 만들기</h2>
            <form onSubmit={handleCreateRoom}>
              <label htmlFor="room-name">방 이름</label>
              <input
                type="text"
                id="room-name"
                name="room-name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                required
              />

              <div className="checkbox-container">
                <input
                  type="checkbox"
                  id="password-protected"
                  checked={isPasswordProtected}
                  onChange={handlePasswordCheckboxChange}
                />
                <label htmlFor="password-protected">비밀번호</label>
              </div>

              {isPasswordProtected && (
                <div className="password-input-container">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="modal-buttons">
                <button type="submit" className="create-room-submit">방 만들기</button>
                <button type="button" onClick={toggleModal} className="close-modal">닫기</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 비밀번호 입력 모달 */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>방에 입장하려면 비밀번호를 입력하세요</h2>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
            />
            <div className="modal-buttons">
              <button onClick={handlePasswordSubmit} className="submit-password">입장</button>
              <button onClick={() => setShowPasswordModal(false)} className="close-modal">닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LobbyRoom;
