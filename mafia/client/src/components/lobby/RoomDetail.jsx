// RoomDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import MafiaVote from "./MafiaVote"; // MafiaVote 컴포넌트 임포트
import CitizenVote from "../vote/citizenVote"; // citizenVote 컴포넌트 임포트
import DoctorVote from "../vote/DoctorVote"; // DoctorVote 컴포넌트 임포트

// 경찰 조사를 위한 모달 컴포넌트
const InvestigationModal = ({ activePlayers, onInvestigate, onClose, investigationDone }) => {
  return (
    <div className="modal-overlay" style={modalOverlayStyle}>
      <div className="modal" style={modalStyle}>
        <h3>조사할 플레이어를 선택하세요</h3>
        <ul>
          {activePlayers.map((player, idx) => (
            <li key={idx}>
              {player}
              <button
                disabled={investigationDone}
                onClick={() => onInvestigate(player)}
                style={{ marginLeft: "10px" }}
              >
                조사
              </button>
            </li>
          ))}
        </ul>
        <button onClick={onClose} style={closeButtonStyle}>
          닫기
        </button>
      </div>
    </div>
  );
};

// 모달에 적용할 간단한 인라인 스타일 (원하는 CSS로 변경 가능)
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
};

const modalStyle = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "8px",
  width: "300px",
  textAlign: "center",
};

const closeButtonStyle = {
  marginTop: "15px",
};

const RoomDetail = () => {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [roomTitle, setRoomTitle] = useState("");
  const [message, setMessage] = useState("");

  // 채팅 및 소켓 관련 상태 변수들
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [nickname, setNickname] = useState(""); // 닉네임 저장
  const [isConnected, setIsConnected] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [role, setRole] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [count, setCount] = useState(0); // 이 count는 소켓에서 받은 인원수로만 업데이트됩니다.
  const [phase, setPhase] = useState("");
  const [activePlayers, setActivePlayers] = useState([]);
  const [investigationDone, setInvestigationDone] = useState(false);
  const [assassinationDone, setAssassinationDone] = useState(false);
  const [showCitizenVoteModal, setShowCitizenVoteModal] = useState(false); // 시민 투표 모달 표시 여부
  const [voteDone, setVoteDone] = useState(false); // 투표 완료 여부
  const [showDoctorModal, setShowDoctorModal] = useState(false); // 의사 투표 모달 표시시
  const [saveDone, setSaveDone] = useState(false); // 의사 투표 완료 여부


  // 모달 표시 여부 (경찰 조사 모달)
  const [showInvestigationModal, setShowInvestigationModal] = useState(false);

  // 컴포넌트 마운트 시 localStorage에서 닉네임 가져오기
  useEffect(() => {
    const storedNickname = localStorage.getItem("user_nickname");
    if (storedNickname) {
      setNickname(storedNickname);
    }
  }, []);

  // roomId에 따라 방 정보를 서버에서 가져오기
  // ※ 현재 인원(count)은 DB의 값이 아닌, 소켓에서 연결된 사용자 수만 표시하도록 처리합니다.
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/room/${roomId}`);
        console.log("API 응답 데이터:", res.data);
        if (res.data.success) {
          console.log("현재 DB에서 받아온 room:", res.data.room);
          setRoom(res.data.room);
          setRoomTitle(res.data.room.room_name);
          // setCount(res.data.room.current_users); // 주석 처리: DB의 인원수 대신 소켓 연결 인원만 사용
        } else {
          setMessage("방 정보를 불러오는 데 실패했습니다.");
        }
      } catch (err) {
        console.error("방 데이터 오류:", err);
        setMessage("방 데이터 로딩 실패");
      }
    };
    fetchRoomData();
  }, [roomId]);

  // 시민 투표
  const handleCitizenVote = (targetPlayer) => {
    if (!socket || !socket.connected) {
      console.log("소켓이 연결되지 않았습니다.");
      return;
    }
    setVoteDone(true);
    socket.emit("citizen vote", targetPlayer, (response) => {
      console.log("시민 투표 응답:", response);
      alert(response.message);
    });
  };
  

  // ----- 수동 소켓 연결 및 해제 함수 (준비/준비 해제 버튼) -----
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

    // 오직 해당 roomId의 메시지만 처리
    _socket.on("new message", (msg) => {
      if (msg.roomId === roomId) {
        console.log(`방(${roomId})에서 받은 메시지:`, msg);
        setMessages((prev) => [...prev, msg]);
      }
    });

    // 기타 이벤트 등록
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
      setMessages((prev) => [
        ...prev,
        { nickname: "SYSTEM", message: "게임이 시작되었습니다!" },
      ]);
    });

    _socket.on("phase changed", (data) => {
      console.log("단계 변경:", data);
      setPhase(data.phase);
      if (data.phase === "night") {
        setInvestigationDone(false);
        setAssassinationDone(false);
      }
      setMessages((prev) => [
        ...prev,
        { nickname: "SYSTEM", message: `현재 단계: ${data.phase}` },
      ]);
    });

    _socket.on("investigation result", (data) => {
      console.log("조사 결과:", data);
      alert(data.message);
    });

    // 브라우저 종료 시 leaveRoom 이벤트 전송
    const handleBeforeUnload = () => {
      _socket.emit("leaveRoom", roomId);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup: 언마운트 시 소켓 연결 해제
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

  // ----- 채팅 메시지 전송 -----
  const sendMessage = () => {
    if (!socket || !socket.connected) {
      console.log("소켓이 연결되지 않았습니다.");
      return;
    }
    if (!userInput.trim()) return;

    const data = { nickname, message: userInput, roomId };
    console.log("방 채팅 메시지 전송:", data);
    socket.emit("new message", data);
    setUserInput("");
  };

  // ----- 게임 시작 (방장 && 인원 4명 이상) -----
  const startGame = () => {
    if (!socket || !socket.connected) {
      console.log("소켓이 연결되지 않았습니다.");
      return;
    }
    if (!isHost || count < 4) {
      console.log("방장이 아니거나 인원이 부족합니다.");
      return;
    }
    console.log("게임 시작!");
    socket.emit("start game");
  };

  // ----- 경찰 조사 요청 -----
  const handleInvestigation = (targetPlayer) => {
    if (!socket || !socket.connected) {
      console.log("소켓이 연결되지 않았습니다.");
      return;
    }
    setInvestigationDone(true);
    socket.emit("investigate", targetPlayer, (response) => {
      console.log("조사 요청 응답:", response);
    });
  };

  // 밤 단계 시마다 조사 및 암살 플래그 초기화
  useEffect(() => {
    if (phase === "night") {
      setInvestigationDone(false);
      setAssassinationDone(false);
    }
  }, [phase]);

  // 낮 마다 시민투표
  useEffect(() => {
    if (phase === "day") {
      setVoteDone(false);
    }
  }, [phase]);
  

  // ----- 마피아 투표 처리 -----
  const handleAssassinate = (targetPlayer) => {
    if (!socket || !socket.connected) {
      console.log("소켓이 연결되지 않았습니다.");
      return;
    }
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

  // 의사 투표 처리 시작
  // 보호 처리 함수
  const handleSave = (targetPlayer) => {
    if (!socket || !socket.connected) {
      console.log("소켓이 연결되지 않았습니다.");
      return;
    }
    setSaveDone(true);
    socket.emit("doctor save", targetPlayer, (response) => {
      console.log("보호 요청 응답:", response);
    });
  };

  // 밤 단계 시마다 보호 초기화
  useEffect(() => {
    if (phase === "night") {
      setSaveDone(false);
    }
  }, [phase]);

  useEffect(() => {
    if (!socket) return;

    // 시민 투표 응답 처리
    socket.on("citizen vote result", (data) => {
      console.log("시민 투표 결과:", data);
      alert(data.message);
    });
  
    // 의사 보호 응답 처리
    socket.on("player saved", (data) => {
      alert(data.message);
    });
  
    // 플레이어 사망 이벤트 처리
    socket.on("player killed", (data) => {
      alert(data.message);
    });
  
    return () => {
      socket.off("player saved");
      socket.off("player killed");
    };
  }, [socket]);

  // 의사 투표 처리 끝

  if (message) {
    return <div>{message}</div>;
  }

  if (!room) {
    return <div>Loading...</div>;
  }

  return (
    <div className="room-container">
      <h1>
        <input
          type="text"
          value={roomTitle}
          onChange={(e) => setRoomTitle(e.target.value)}
          className="room-title-input"
          disabled
        />
      </h1>
      <p>현재 역할: {role || "없음"}</p>
      <p>현재 접속 인원: {count}</p>
      <input
        type="text"
        placeholder="유저 이름 입력"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        className="input-field"
      />
      {/* 준비 / 준비 해제 버튼 */}
      <div className="connection-buttons">
        <button onClick={connectToChatServer} className="btn connect-btn">
          준비
        </button>
        <button onClick={disconnectFromChatServer} className="btn disconnect-btn">
          준비 해제
        </button>
      </div>
      {/* 방장인 경우 (그리고 인원이 4명 이상이며 게임이 시작되지 않았을 때) 게임 시작 버튼 표시 */}
      {isHost && count >= 4 && !gameStarted && (
        <button onClick={startGame} className="btn start-game-btn">
          게임 시작
        </button>
      )}
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
        <button onClick={sendMessage} className="btn send-btn">
          보내기
        </button>
      </div>
      {/* 경찰 역할이고 밤 단계일 경우 조사 버튼 */}
      {role === "경찰" && phase === "night" && !investigationDone && (
        <button onClick={() => setShowInvestigationModal(true)} className="btn investigation-btn">
          조사하기
        </button>
      )}

      {/* 시민투표 버튼 */}
      {phase === "day" && !voteDone && (
        <button onClick={() => setShowCitizenVoteModal(true)} className="btn citizen-vote-btn">
          시민 투표하기
        </button>
      )}

      {/* 시민투표 모달 */}
      {showCitizenVoteModal && (
        <CitizenVote
          activePlayers={activePlayers}
          onVote={(player) => {
            handleCitizenVote(player);
            setShowCitizenVoteModal(false);
          }}
          voteDone={voteDone}
          username={nickname}
        />
      )}

      {/* 모달창 조건부 렌더링 */}
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

      {/* 마피아가 누구 죽일지 투표 */}
      {role === "마피아" && phase === "night" && (
        <MafiaVote
          activePlayers={activePlayers} // 활성 플레이어 목록
          onAssassinate={handleAssassinate} // 암살 처리 함수
          assassinationDone={assassinationDone} // 암살 완료 여부
          username={nickname} // 사용자 이름
        />

      )}

      {/* 의사가 누굴 살릴지 투표 */}
      {/* UI에 보호 버튼 및 모달 추가 */}
      {role === "의사" && phase === "night" && !saveDone && (
        <button onClick={() => setShowDoctorModal(true)} className="btn save-btn">
          보호하기
        </button>
      )}

      {showDoctorModal && (
        <DoctorVote
          activePlayers={activePlayers} // 활성 플레이어 목록
          onSave={(player) => {
            handleSave(player);
            setShowDoctorModal(false);
          }}
          saveDone={saveDone}
        />
      )}
    </div>
  );
};

export default RoomDetail;
