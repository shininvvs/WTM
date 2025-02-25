// src/components/lobby/RoomDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import MafiaVote from "../vote/MafiaVote"; // 원본대로 MafiaVote 사용
import CitizenVote from "../vote/citizenVote";
import DoctorVote from "../vote/DoctorVote";
import MafiaChat from "../chat/mafiaChat";

// 경찰 조사 모달 컴포넌트
const InvestigationModal = ({ activePlayers, onInvestigate, onClose, investigationDone }) => {
  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    color: "#000",
  };
  const modalStyle = {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    width: "300px",
    textAlign: "center",
    color: "#000",
  };
  const closeButtonStyle = {
    marginTop: "15px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    padding: "5px 10px",
    borderRadius: "4px",
  };
  return (
    <div className="modal-overlay" style={modalOverlayStyle}>
      <div className="modal" style={modalStyle}>
        <h3>조사할 플레이어를 선택하세요</h3>
        <ul>
          {activePlayers.map((player, idx) => (
            <li key={idx}>
              {player}
              <button
                type="button"
                disabled={investigationDone}
                onClick={() => onInvestigate(player)}
                style={{
                  marginLeft: "10px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "4px",
                }}
              >
                조사
              </button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={onClose} style={closeButtonStyle}>닫기</button>
      </div>
    </div>
  );
};

// 방장 추방 모달 컴포넌트
const KickModal = ({ activePlayers, onKick, onClose }) => {
  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    color: "#000",
  };
  const modalStyle = {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    width: "300px",
    textAlign: "center",
    color: "#000",
  };
  const closeButtonStyle = {
    marginTop: "15px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    padding: "5px 10px",
    borderRadius: "4px",
  };
  return (
    <div className="modal-overlay" style={modalOverlayStyle}>
      <div className="modal" style={modalStyle}>
        <h3>추방할 플레이어를 선택하세요</h3>
        <ul>
          {activePlayers.map((player, idx) => (
            <li key={idx}>
              {player}
              <button
                type="button"
                onClick={() => onKick(player)}
                style={{
                  marginLeft: "10px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "4px",
                }}
              >
                추방
              </button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={onClose} style={closeButtonStyle}>닫기</button>
      </div>
    </div>
  );
};

// 채팅 컨테이너 컴포넌트 (원본 그대로)
const ChatContainer = ({ messages, userInput, setUserInput, sendMessage }) => {
  return (
    <div className="chat-container">
      <ul className="message-list">
        {messages.map((m, index) => (
          <li key={index} className="chat-message">
            <span className="chat-username">{m.nickname}:</span> {m.message}
          </li>
        ))}
      </ul>
      <input
        type="text"
        placeholder="메시지 입력..."
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        className="input-field"
      />
      <button type="button" onClick={sendMessage} className="btn send-btn">보내기</button>
    </div>
  );
};

// 연결 버튼 컴포넌트 (수정됨: handleExitRoom prop 추가)
const ConnectionButtons = ({ connectToChatServer, disconnectFromChatServer, handleExitRoom }) => {
  return (
    <div className="connection-buttons">
      <button type="button" onClick={connectToChatServer} className="btn connect-btn">준비</button>
      <button type="button" onClick={disconnectFromChatServer} className="btn disconnect-btn">준비 해제</button>
      <button type="button" onClick={handleExitRoom} className="">나가기</button>
    </div>
  );
};

// 방장 전용 게임 컨트롤 컴포넌트 (원본 그대로)
const GameControl = ({ isHost, count, gameStarted, startGame }) => {
  return (
    <>
      {isHost && count >= 4 && !gameStarted && (
        <button type="button" onClick={startGame} className="btn start-game-btn">게임 시작</button>
      )}
    </>
  );
};

// 의사 살리기 모달 컴포넌트
const DoctorSaveModal = ({ activePlayers, onSave, onClose, saveDone }) => {
  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    color: "#000",
  };
  const modalStyle = {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    width: "300px",
    textAlign: "center",
    color: "#000",
  };
  const closeButtonStyle = {
    marginTop: "15px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    padding: "5px 10px",
    borderRadius: "4px",
  };
  return (
    <div className="modal-overlay" style={modalOverlayStyle}>
      <div className="modal" style={modalStyle}>
        <h3>살릴 플레이어를 선택하세요</h3>
        <ul>
          {activePlayers.map((player, idx) => (
            <li key={idx}>
              {player}
              <button
                type="button"
                disabled={saveDone}
                onClick={() => onSave(player)}
                style={{
                  marginLeft: "10px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "4px",
                }}
              >
                살리기
              </button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={onClose} style={closeButtonStyle}>닫기</button>
      </div>
    </div>
  );
};

const RoomDetail = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [roomTitle, setRoomTitle] = useState("");
  const [message, setMessage] = useState("");

  // 소켓 및 채팅 상태
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [nickname, setNickname] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [role, setRole] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState("");
  const [activePlayers, setActivePlayers] = useState([]);
  const [investigationDone, setInvestigationDone] = useState(false);
  const [saveDone, setSaveDone] = useState(false);
  const [assassinationDone, setAssassinationDone] = useState(false);
  const [skipUsed, setSkipUsed] = useState(false);

  // 모달 상태
  const [showInvestigationModal, setShowInvestigationModal] = useState(false);
  const [showKickModal, setShowKickModal] = useState(false);
  const [showDoctorSaveModal, setShowDoctorSaveModal] = useState(false);


  useEffect(() => {
    const storedNickname = localStorage.getItem("user_nickname");
    if (storedNickname) setNickname(storedNickname);
  }, []);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/room/${roomId}`);
        if (res.data.success) {
          setRoom(res.data.room);
          setRoomTitle(res.data.room.room_name);
        } else {
          setMessage("방 정보를 불러오는 데 실패했습니다.");
        }
      } catch (err) {
        setMessage("방 데이터 로딩 실패");
      }
    };
    fetchRoomData();
  }, [roomId]);

  const connectToChatServer = () => {
    if (!nickname.trim()) {
      alert("닉네임을 입력하세요!");
      return;
    }
    if (socket && socket.connected) {
      console.log("이미 연결된 상태입니다.");
      return;
    }
    const _socket = io("http://localhost:3000", {
      autoConnect: false,
      query: { nickname, roomId },
    });
    _socket.connect();
    setSocket(_socket);
    _socket.on("connect", () => {
      console.log(`${nickname}님이 방(${roomId})에 입장`);
      setIsConnected(true);
      _socket.emit("joinRoom", roomId);
    });
    _socket.on("disconnect", () => {
      console.log("소켓 연결 끊김");
      setIsConnected(false);
    });
    _socket.on("new message", (msg) => {
      if (msg.roomId === roomId) {
        console.log(`방(${roomId})에서 받은 메시지:`, msg);
        setMessages((prev) => [...prev, msg]);
      }
    });
    _socket.on("host status", (data) => {
      console.log("방장 여부:", data);
      setIsHost(data.isHost);
    });
    _socket.on("update user count", (data) => {
      console.log(`현재 접속 인원: ${data.count}`);
      setCount(data.count);
    });
    _socket.on("update active players", (data) => {
      console.log("활성 플레이어 목록 업데이트:", data.players);
      setActivePlayers(data.players);
    });
    _socket.on("assigned role", (data) => {
      console.log("역할 배정:", data);
      setRole(data.role);
    });
    _socket.on("game started", () => {
      console.log("게임 시작됨!");
      setGameStarted(true);
      setMessages((prev) => [...prev, { nickname: "SYSTEM", message: "게임이 시작되었습니다!" }]);
    });
    _socket.on("phase changed", (data) => {
      setPhase(data.phase);
      if (data.phase === "night") {
        setInvestigationDone(false);
        setAssassinationDone(false);
        setSkipUsed(false);
      }
      setMessages((prev) => [...prev, { nickname: "SYSTEM", message: `현재 단계: ${data.phase}` }]);
    });
    _socket.on("investigation result", (data) => {
      console.log("조사 결과:", data);
      alert(data.message);
    });
    _socket.on("phase time adjusted", (data) => {
      console.log("남은 시간 조정:", data.remaining);
    });
    _socket.on("kicked", (data) => {
      alert(data.message);
      navigate("/lobby");
    });

    const handleBeforeUnload = () => {
      _socket.emit("leaveRoom", roomId);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      _socket.disconnect();
    };
  };

  const disconnectFromChatServer = () => {
    if (socket) {
      socket.disconnect();
      setIsConnected(false);
      console.log("소켓 연결 해제됨.");
    }
  };

  const sendMessageHandler = () => {
    if (!socket || !socket.connected) return;
    if (!userInput.trim()) return;
    const data = { nickname, message: userInput, roomId };
    console.log("방 채팅 메시지 전송:", data);
    socket.emit("new message", data);
    setUserInput("");
  };

  const startGameHandler = async () => {
    if (!socket || !socket.connected) return;
    if (!isHost || count < 4) {
      console.log("방장이 아니거나 인원이 부족합니다.");
      return;
    }

    console.log("게임 시작!");
    socket.emit("start game");

    try {
      const res = await axios.post(`http://localhost:3000/startGame/${roomId}`);
      if (res.data.success) {
        console.log("게임 상태 업데이트 성공!");
      } else {
        console.log("게임 상태 업데이트 실패:", res.data.message);
      }
    } catch (error) {
      console.error("게임 상태 업데이트 중 오류 발생:", error);
    }
  };

  const handleInvestigation = (targetPlayer) => {
    if (!socket || !socket.connected) return;
    setInvestigationDone(true);
    socket.emit("investigate", targetPlayer, (response) => {
      console.log("조사 요청 응답:", response);
    });
  };

  const handleAssassinate = (targetPlayer) => {
    if (!socket || !socket.connected) return;
    setAssassinationDone(true);
    socket.emit("assassinate", targetPlayer, (response) => {
      if (response.success) {
        console.log("암살 요청 응답:", response.message);
        alert(response.message);
      } else {
        console.log("암살 실패:", response.message);
      }
    });
  };

  const handleSkipPhase = () => {
    if (!socket || !socket.connected) return;
    if (skipUsed) {
      alert("이미 스킵 기능을 사용했습니다.");
      return;
    }
    socket.emit("skip phase", (response) => {
      if (response.status === "ok") {
        alert(response.message);
        setSkipUsed(true);
      } else {
        alert(response.message);
      }
    });
  };

  // 새로 추가된 handleExtendPhase 함수
  const handleExtendPhase = () => {
    if (!socket || !socket.connected) return;
    socket.emit("extend phase", (response) => {
      if (response.status === "ok") {
        alert(response.message);
      } else {
        alert(response.message);
      }
    });
  };

  // 나가기 버튼 클릭 시 처리
  const handleExitRoom = async () => {
    console.log("나가기 버튼 클릭됨");
    try {
      const res = await axios.post(`http://localhost:3000/room/exit/${roomId}`);
      if (res.data.success) {
        alert("방에서 나갔습니다.");
        navigate("/lobby");  // 나가기 후 로비로 돌아가기
      } else {
        alert("방 나가기 실패");
      }
    } catch (err) {
      console.error("방 나가기 실패", err);
      alert("오류가 발생했습니다.");
    }
  };

  // 마피아가 2명일 때만 채팅창 보여지게끔
  useEffect(() => {
    if (activePlayers.length > 0) {
      const mafiaCnt = activePlayers.filter(player => player.role === "마피아").length;
      // mafiaCount 상태 업데이트 (사용 예시)
    }
  }, [activePlayers]);

  useEffect(() => {
    if (phase === "night") {
      setInvestigationDone(false);
      setAssassinationDone(false);
      setSkipUsed(false);
    }
  }, [phase]);

  if (message) return <div>{message}</div>;
  if (!room) return <div>Loading...</div>;

  return (
    <div className="room-container" style={{ padding: "20px", color: "#000" }}>
      <h1>
        <input
          type="text"
          value={roomTitle}
          onChange={(e) => setRoomTitle(e.target.value)}
          className="room-title-input"
          disabled
          style={{
            padding: "8px",
            fontSize: "1.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
            color: "#000",
          }}
        />
      </h1>
      <p style={{ color: "#fff" }}>현재 역할: {role || "없음"}</p>
      <p style={{ color: "#fff" }}>현재 접속 인원 : {room.current_users}</p>
      <p style={{ color: "#fff" }}>게임 준비 인원: {count}</p>
      <input
        type="text"
        placeholder="유저 이름 입력"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        className="input-field"
        style={{
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          marginBottom: "10px",
          color: "#000",
        }}
      />
      <ConnectionButtons
        connectToChatServer={connectToChatServer}
        disconnectFromChatServer={disconnectFromChatServer}
        handleExitRoom={handleExitRoom}
      />
      <GameControl isHost={isHost} count={count} gameStarted={gameStarted} startGame={startGameHandler} />
      
      {/* skip 및 extend 버튼은 'day' 페이즈일 때만 표시 */}
      {phase === "day" && (
        <div style={{ margin: "10px 0" }}>
          {!skipUsed && (
            <button
              type="button"
              onClick={handleSkipPhase}
              style={{
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                padding: "5px 10px",
                borderRadius: "4px",
              }}
              className="btn skip-btn"
            >
              스킵 (5초 단축)
            </button>
          )}
          <button
            type="button"
            onClick={handleExtendPhase}
            style={{
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              padding: "5px 10px",
              borderRadius: "4px",
              marginLeft: "10px"
            }}
            className="btn extend-btn"
          >
            늘리기 (5초 증가)
          </button>
        </div>
      )}

      <div className="chat-container">
        <ul
          className="message-list"
          style={{
            height: "300px",
            overflowY: "scroll",
            border: "1px solid #ccc",
            padding: "10px",
            listStyle: "none",
          }}
        >
          {messages.map((m, index) => (
            <li key={index} className="chat-message" style={{ height: "50px" }}>
              <span className="chat-username">{m.nickname}:</span> {m.message}
            </li>
          ))}
        </ul>
        <input
          type="text"
          placeholder="메시지 입력..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="input-field"
        />
        <button type="button" onClick={sendMessageHandler} className="btn send-btn">보내기</button>
      </div>

      {/* 원본대로 MafiaChat 및 MafiaVote 사용 */}
      <MafiaChat role={role} nickname={nickname} socket={socket} roomId={roomId} />

      {role === "경찰" && phase === "night" && !investigationDone && (
        <button
          type="button"
          onClick={() => setShowInvestigationModal(true)}
          className="btn investigation-btn"
          style={{
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            padding: "5px 10px",
            borderRadius: "4px",
            margin: "5px",
          }}
        >
          조사하기
        </button>
      )}
      {showInvestigationModal && (
        <InvestigationModal
          activePlayers={activePlayers.filter((player) => player !== nickname)}
          investigationDone={investigationDone}
          onInvestigate={(player) => {
            handleInvestigation(player);
            setShowInvestigationModal(false);
          }}
          onClose={() => setShowInvestigationModal(false)}
        />
      )}

      {role === "의사" && phase === "night" && !saveDone && (
        <button
          type="button"
          onClick={() => setShowDoctorSaveModal(true)}
          className="btn investigation-btn"
          style={{
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            padding: "5px 10px",
            borderRadius: "4px",
            margin: "5px",
          }}
        >
          살리기
        </button>
      )}
      {showDoctorSaveModal && ( // 여기에 살리는 로직
        <DoctorSaveModal
          activePlayers={activePlayers.filter((player) => player !== nickname)}
          saveDone={saveDone}
          onSave={(player) => {
            handleSave(player);
            setShowDoctorSaveModal(false);
          }}
          onClose={() => setShowDoctorSaveModal(false)}
        />
      )}

      {isHost && (
        <button
          type="button"
          onClick={() => setShowKickModal(true)}
          className="btn kick-btn"
          style={{
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            padding: "5px 10px",
            borderRadius: "4px",
            margin: "5px",
          }}
        >
          추방하기
        </button>
      )}
      {showKickModal && (
        <KickModal
          activePlayers={activePlayers.filter((player) => player !== nickname)}
          onKick={(player) => {
            socket.emit("kick user", player, (response) => {
              console.log("추방 응답:", response);
            });
            setShowKickModal(false);
          }}
          onClose={() => setShowKickModal(false)}
        />
      )}
      {role === "마피아" && phase === "night" && (
        <MafiaVote
          activePlayers={activePlayers}
          nickname={nickname}
          assassinationDone={assassinationDone}
          handleAssassinate={handleAssassinate}
        />
      )}
    </div>
  );
};

export default RoomDetail;
