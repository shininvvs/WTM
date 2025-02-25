import React, { useState, useEffect } from "react";
import "../../styles/chat/mafiaChat.css";

const MafiaChat = ({ role, nickname, socket, roomId }) => {
  const [mafiaMessages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    console.log("마피아 채팅 - 소켓 상태:", socket);

    // 리스너 중복 방지를 위해 socket.off로 기존 리스너를 제거
    if (role === "마피아" && socket) {
      socket.off("mafiaMessage"); // 기존 리스너를 제거하여 중복 방지

      // 새로운 리스너 등록
      socket.on("mafiaMessage", (message) => {
        setMessages((prev) => [...prev, message]);
      });

      // 방을 join할 때 추가적인 이벤트 핸들러를 설정
      socket.emit("joinRoom", { nickname, role, roomId });

      // 컴포넌트가 언마운트되거나 role, socket, roomId가 변경될 때 리스너를 제거
      return () => {
        socket.off("mafiaMessage"); // 컴포넌트 언마운트 시 리스너 제거
      };
    }
  }, [role, socket, nickname, roomId]); // role, socket, nickname, roomId가 변경될 때마다 실행

  const sendMessage = () => {
    if (input.trim() && role === "마피아" && socket) {
      const messageData = { sender: nickname, text: input, role };

      // 자신의 메시지를 먼저 UI에 추가 (자기 채팅창에 즉시 반영)
      setMessages((prev) => [...prev, messageData]);

      // 서버에 메시지 전송
      socket.emit("mafiaMessage", messageData);

      // 입력창 초기화
      setInput("");
    }
  };

  if (role !== "마피아") return null;  // 마피아 역할을 가진 사람만 볼 수 있음

  return (
    <div className="mafia-chat">
      <h3>마피아 채팅</h3>
      <div className="chat-box">
        {mafiaMessages.map((msg, index) => (
          <p
            key={index}
            className={msg.sender === nickname ? "sent" : "received"}
          >
            <strong>{msg.sender}:</strong> {msg.text}
          </p>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="마피아끼리만 대화 가능"
      />
      <button onClick={sendMessage}>전송</button>
    </div>
  );
};

export default MafiaChat;
