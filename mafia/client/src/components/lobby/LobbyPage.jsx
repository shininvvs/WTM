import React from "react";
import LobbyRoom from "./LobbyRoom"; // LobbyRoom 컴포넌트 import
import LobbyChat from './LobbyChat';


const LobbyPage = () => {
  return (
    <div>
      <LobbyRoom />
      <LobbyChat />
    </div>
  );
};

export default LobbyPage;