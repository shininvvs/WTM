import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './lobbySetting.css';

function RoomSetting() {
  const [count, setCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [userInput, setUserInput] = useState('');
  const [socket, setSocket] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [role, setRole] = useState('');
  const [isHost, setIsHost] = useState(false);

  function connectToChatServer() {
    console.log("사용자가 입력한 username:", username);

    if (socket && socket.connected) {
      console.log('이미 연결되어 있습니다.');
      return;
    }

    // ★ 여기서 서버 주소: http://localhost:3000
    // (백엔드가 3000번 포트에서 listen 중)
    const _socket = io('http://localhost:3000', {
      autoConnect: false,
      query: { username }
    });

    _socket.connect();

    _socket.on('connect', () => {
      console.log('소켓 연결 상태:', _socket.connected);
      setIsConnected(true);
    });

    _socket.on('connect_error', (err) => {
      console.error('소켓 연결 에러:', err);
    });

    setSocket(_socket); // 
  }

  function disconnectToChatServer() {
    if (!socket || !socket.connected) {
      console.log('이미 접속 종료된 상태입니다.');
      return;
    }
    console.log('disconnectToChatServer');
    socket.disconnect();
    setIsConnected(false);
  }

  function onConnected() {
    console.log('프론트 - onConnected');
    setIsConnected(true);
  }

  function onDisconnected() {
    console.log('프론트 - onDisconnected');
    setIsConnected(false);
  }

  function onMessageReceived(msg) {
    console.log('프론트 - onMessageReceived', msg);
    setMessages(previous => [...previous, msg]);
  }

  function sendMessageToChatServer() {
    if (!socket || !socket.connected) {
      console.log('소켓이 연결되지 않았습니다.');
      return;
    }
    socket.emit('new message', { username, message: userInput }, (response) => {
      console.log('서버 ACK:', response);
    });
    setUserInput('');
  }

  // 게임 시작
  function startGame() {
    if (!socket || !socket.connected) {
      console.log('소켓이 연결되지 않았습니다.');
      return;
    }
    console.log('게임 시작!');
    socket.emit('start game');
    setGameStarted(true);
  }

  function onRoleAssigned(data) {
    console.log('역할 배정 이벤트 수신:', data);
    setRole(data.role);
  }

  // 소켓 이벤트 등록
  useEffect(() => {
    if (!socket) return;

    socket.on('connect', onConnected);
    socket.on('disconnect', onDisconnected);

    socket.on('new message', onMessageReceived);

    socket.on('host status', (data) => {
      console.log('host status:', data);
      setIsHost(data.isHost);
    });

    socket.on('update user count', (data) => {
      console.log(`현재 접속 인원: ${data.count}`);
      setCount(data.count);
    });

    socket.on('assigned role', onRoleAssigned); //배정된 역할(role) 상태에 저장

    socket.on('game started', () => {
      console.log('게임이 시작되었습니다!');
      setMessages(prev => [
        ...prev,
        { username: "SYSTEM", message: "게임이 시작되었습니다!" }
      ]);
    });

    socket.on('phase changed', (data) => { // 시스템 메세지로 “어느 단계가 시작되었습니다.” 표시
      console.log('Phase changed:', data);

      let phaseText = "";
      switch (data.phase) {
        case "night":
          phaseText = "밤이 되었습니다.";
          break;
        case "day":
          phaseText = "낮이 되었습니다.";
          break;
        case "voting":
          phaseText = "투표 시간입니다.";
          break;
        case "rebuttal":
          phaseText = "반론 시간입니다.";
          break;
        case "finalVoting":
          phaseText = "최종 투표 시간입니다.";
          break;
        default:
          phaseText = "알 수 없는 단계입니다.";
      }
      const systemMsg = { username: "SYSTEM", message: phaseText };
      setMessages(prev => [...prev, systemMsg]);
    });

    return () => {
      socket.off('connect', onConnected);
      socket.off('disconnect', onDisconnected);
      socket.off('new message', onMessageReceived);
      socket.off('host status');
      socket.off('update user count');
      socket.off('assigned role', onRoleAssigned);
      socket.off('game started');
      socket.off('phase changed');
    };
  }, [socket]);

  const messageList = messages.map((m, index) =>
    <li key={index} className="chat-message">
      <span className="chat-username">{m.username} :</span> {m.message}
    </li>
  );

  return (
    <div className="container">
      <div className="sub">
        <div className="card">
          <div className="info-section">
            <h2>유저:
              <span className="highlight">
                {username || '이름 미입력'}
              </span>
            </h2>
            <h2>현재 접속 상태:
              <span className={`highlight ${isConnected ? 'connected' : 'disconnected'}`}>
                {isConnected ? "접속중" : "미접속"}
              </span>
            </h2>
            <h2>현재 접속중인 유저 수:
              <span className="highlight">{count}</span>
            </h2>
            {role && (
              <h2>당신의 역할:
                <span className="highlight">{role}</span>
              </h2>
            )}
          </div>
        </div>

        <div className="card">
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="유저이름 입력"
            className="input-field"
          />
          <div className="button-group">
            <button onClick={connectToChatServer} className="btn connect-btn">
              접속
            </button>
            <button onClick={disconnectToChatServer} className="btn disconnect-btn">
              접속 종료
            </button>

            {isHost && count >= 4 && !gameStarted && (
              <button onClick={startGame} className="btn start-game-btn">
                게임 시작
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="message">
        <div className="message_back">
          <ul className="message-list">
            {messageList}
          </ul>
        </div>

        <div className="card">
          <input
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            placeholder="메시지 입력"
            className="input-field"
          />
          <button onClick={sendMessageToChatServer} className="btn send-btn">
            보내기
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoomSetting;
