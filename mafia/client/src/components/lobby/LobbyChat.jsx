import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "../../styles/lobby/LobbyChat.css";

const Lobby = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]); // ✅ 상태 초기화
  const [userInput, setUserInput] = useState("");
  const [nickname, setNickname] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const storedNickname = localStorage.getItem("user_nickname");
    if (storedNickname) {
      setNickname(storedNickname);
    }
  }, []);

  useEffect(() => {
    if (!nickname) return;

    console.log("소켓 연결을 시도합니다...");
    const _socket = io("http://localhost:3000", {
      autoConnect: false,
      query: { nickname, roomId: "lobbyRoom" },
    });

    _socket.connect();
    setSocket(_socket);

    _socket.on("connect", () => {
      console.log(`${nickname}님이 로비 채팅방에 입장`);
      setIsConnected(true);
      _socket.emit("joinRoom", "lobbyRoom");
    });

    _socket.on("disconnect", () => {
      console.log("소켓 연결 끊김");
      setIsConnected(false);
    });

    return () => {
      _socket.disconnect();
    };
  }, [nickname]);

  // ✅ 메시지 수신 이벤트 등록
  useEffect(() => {
    if (!socket) return;

    const messageHandler = (msg) => {
      console.log("수신된 메시지:", msg);
      if (msg.roomId === "lobbyRoom") {
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages, msg];
          console.log("업데이트된 메시지 배열:", updatedMessages); // ✅ 디버깅 로그
          return updatedMessages;
        });
      }
    };

    socket.on("new message", messageHandler);

    return () => {
      socket.off("new message", messageHandler);
    };
  }, [socket]); // ✅ `socket`이 변경될 때만 실행

  const sendMessageToChatServer = () => {
    if (!userInput.trim()) {
      console.log("빈 메시지는 전송하지 않습니다.");
      return;
    }

    console.log("로비 메시지 전송:", { 
      nickname, 
      message: userInput, 
      roomId: "lobbyRoom" 
    });

    socket?.emit("new message", {
      nickname,
      message: userInput,
      roomId: "lobbyRoom",
    });

    setUserInput(""); // 입력 필드 초기화
  };

  return (
    <div className="login-container">
      <h1 className="login-title">로비</h1>
      <div className="chat-container">
        <div className="chat-messages">
          <ul>
            {messages.map((msg, index) => (
              <li key={index} className={msg.nickname === nickname ? "sent" : "received"}>
                <strong>{msg.nickname}</strong>: {msg.message}
              </li>
            ))}
          </ul>
        </div>
        <div className="chat-input">
          <input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="메시지 입력"
          />
          <button onClick={sendMessageToChatServer}>보내기</button>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
