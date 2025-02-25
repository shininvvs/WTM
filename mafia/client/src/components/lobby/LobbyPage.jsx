// lobbyPage.jsx
import React from "react";
import LobbyRoom from "./LobbyRoom"; // LobbyRoom 컴포넌트 import
import LobbyChat from './LobbyChat';


const LobbyPage = () => {
  // 새로고침 버튼 클릭 시 실행될 함수
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div>
      <button onClick={handleRefresh} style={buttonStyle}>
        새로고침
      </button>
      <LobbyRoom />
      <LobbyChat />
    </div>
  );
};

// 버튼 스타일 정의
const buttonStyle = {
  position: "absolute", // 다른 요소 위로 올리기 위해 절대 위치 적용
  top: "10px",
  left: "10px",
  padding: "10px 20px",
  fontSize: "16px",
  backgroundColor: "#00aaff",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  zIndex: 9999, // z-index 최상위로 설정
};

export default LobbyPage;