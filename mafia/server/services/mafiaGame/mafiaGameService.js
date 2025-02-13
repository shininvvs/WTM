// mafiaGameService.js

// 각 룸별 게임 상태를 저장하는 Map
// key: roomId, value: 게임 상태 객체 (activeUsers, hostUsername, gameStarted 등)
const games = new Map();

// 게임 각 단계의 지속 시간 (초 단위)
const NIGHT_DURATION = 5;
const DAY_DURATION = 5;
const VOTING_DURATION = 5;
const REBUTTAL_DURATION = 5;
const FINAL_VOTING_DURATION = 5;

// 게임에서 순차적으로 진행되는 단계와 지속 시간을 정의한 배열
const gamePhases = [
  { name: "night", duration: NIGHT_DURATION },
  { name: "day", duration: DAY_DURATION },
  { name: "voting", duration: VOTING_DURATION },
  { name: "rebuttal", duration: REBUTTAL_DURATION },
  { name: "finalVoting", duration: FINAL_VOTING_DURATION },
];

/**
 * 지정된 roomId에 대한 게임 상태 객체를 반환합니다.
 * 없으면 새로 생성하여 반환합니다.
 * @param {string} roomId 
 * @returns {object} 게임 상태 객체
 */
function getGame(roomId) {
  if (!games.has(roomId)) {
    games.set(roomId, {
      activeUsers: new Map(), // 해당 룸의 사용자 정보 (key: username, value: 사용자 정보 객체)
      hostUsername: null,
      gameStarted: false,
      gameInProgress: false,
      currentPhaseIndex: 0,
      phaseTimer: null,
    });
  }
  return games.get(roomId);
}

/**
 * 사용자를 지정된 룸에 등록합니다.
 * 첫 번째 등록된 사용자는 방장이 됩니다.
 * @param {string} roomId 
 * @param {string} username 
 * @param {string} socketId 
 */
function registerUser(roomId, username, socketId) {
  const game = getGame(roomId);
  if (!game.hostUsername) {
    game.hostUsername = username;
  }
  game.activeUsers.set(username, {
    username,
    socketId,
    role: null, // 게임 시작 시 assignRoles()에서 지정
    isHost: username === game.hostUsername,
    investigated: false, // 경찰 조사 여부 (경찰 전용)
  });
}

/**
 * 지정된 룸에서 사용자를 제거합니다.
 * @param {string} roomId 
 * @param {string} username 
 */
function unregisterUser(roomId, username) {
  const game = getGame(roomId);
  if (game.activeUsers.has(username)) {
    game.activeUsers.delete(username);
  }
  if (username === game.hostUsername) {
    game.hostUsername = null;
  }
}

/**
 * 지정된 룸에서 해당 사용자가 방장인지 확인합니다.
 * @param {string} roomId 
 * @param {string} username 
 * @returns {boolean}
 */
function isHost(roomId, username) {
  const game = getGame(roomId);
  const user = game.activeUsers.get(username);
  return user?.isHost === true;
}

/**
 * 지정된 룸의 사용자 수를 반환합니다.
 * @param {string} roomId 
 * @returns {number}
 */
function getUserCount(roomId) {
  const game = getGame(roomId);
  return game.activeUsers.size;
}

/**
 * 지정된 룸의 사용자들에게 역할을 무작위로 배정합니다.
 * @param {string} roomId 
 */
function assignRoles(roomId) {
  const game = getGame(roomId);
  const playerCount = game.activeUsers.size;
  let mafiaCount = 0, policeCount = 0, doctorCount = 0;

  // 플레이어 수에 따른 역할 수 결정 (예시)
  if (playerCount === 4) {
    mafiaCount = 2;
    policeCount = 1;
    doctorCount = 1;
  } else if (playerCount === 5) {
    mafiaCount = 1;
    policeCount = 1;
    doctorCount = 1;
  } else {
    mafiaCount = 2;
    policeCount = 1;
    doctorCount = 1;
  }
  const citizenCount = playerCount - (mafiaCount + policeCount + doctorCount);

  // activeUsers의 모든 사용자 이름을 배열로 변환 후 무작위 섞기
  let players = Array.from(game.activeUsers.keys());
  shuffleArray(players);

  // 역할 할당
  for (let i = 0; i < mafiaCount; i++) {
    const name = players.pop();
    game.activeUsers.get(name).role = "마피아";
  }
  for (let i = 0; i < policeCount; i++) {
    const name = players.pop();
    game.activeUsers.get(name).role = "경찰";
    game.activeUsers.get(name).investigated = false;
  }
  for (let i = 0; i < doctorCount; i++) {
    const name = players.pop();
    game.activeUsers.get(name).role = "의사";
  }
  for (let i = 0; i < citizenCount; i++) {
    const name = players.pop();
    game.activeUsers.get(name).role = "시민";
  }
}

/**
 * 지정된 룸의 게임을 시작합니다.
 * @param {string} roomId 
 */
function startGame(roomId) {
  const game = getGame(roomId);
  game.gameStarted = true;
  game.gameInProgress = true;
  game.currentPhaseIndex = 0;
  assignRoles(roomId);
  console.log(`===== 룸 ${roomId} 게임 시작: 역할 배정 완료 =====`);
}

/**
 * 지정된 룸의 게임을 중단합니다.
 * @param {string} roomId 
 */
function stopGame(roomId) {
  const game = getGame(roomId);
  game.gameStarted = false;
  game.gameInProgress = false;
  game.currentPhaseIndex = 0;
  if (game.phaseTimer) {
    clearTimeout(game.phaseTimer);
    game.phaseTimer = null;
  }
  console.log(`===== 룸 ${roomId} 게임이 중단되었습니다. =====`);
}

/**
 * 지정된 룸에서 게임 단계를 진행시킵니다.
 * 각 단계의 지속 시간이 지나면 다음 단계로 넘어가며, onPhaseChanged 콜백을 호출합니다.
 * @param {string} roomId 
 * @param {function} onPhaseChanged 
 */
function proceedToPhase(roomId, onPhaseChanged) {
  const game = getGame(roomId);
  if (!game.gameInProgress) return;

  const phase = gamePhases[game.currentPhaseIndex];

  // 기존 타이머가 있다면 클리어
  if (game.phaseTimer) {
    clearTimeout(game.phaseTimer);
  }

  // 밤 단계일 경우, 경찰의 조사 상태 초기화
  if (phase.name === "night") {
    game.activeUsers.forEach((user) => {
      if (user.role === "경찰") {
        user.investigated = false;
      }
    });
  }

  // 단계 변경 콜백 호출
  if (typeof onPhaseChanged === "function") {
    onPhaseChanged(phase);
  }

  // 현재 단계의 지속 시간 후 다음 단계로 전환
  game.phaseTimer = setTimeout(() => {
    game.currentPhaseIndex = (game.currentPhaseIndex + 1) % gamePhases.length;
    proceedToPhase(roomId, onPhaseChanged);
  }, phase.duration * 1000);
}

/**
 * 배열을 무작위로 섞는 함수 (Fisher-Yates shuffle 알고리즘)
 * @param {Array} arr 
 */
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/**
 * 지정된 룸의 활성 사용자 정보를 반환합니다.
 * @param {string} roomId 
 * @returns {Map}
 */
function getActiveUsers(roomId) {
  const game = getGame(roomId);
  return game.activeUsers;
}

// 밤 동안 의사가 보호한 플레이어와 마피아가 암살한 플레이어를 저장하는 맵
const savedPlayers = new Map(); // 방 ID -> 보호된 플레이어
const killedPlayers = new Map(); // 방 ID -> 암살된 플레이어

/**
 * 특정 방에서 의사가 보호한 플레이어를 설정
 * @param {string} roomId - 방 ID
 * @param {string} player - 보호할 플레이어의 닉네임
 */
function setSavedPlayer(roomId, player) {
  savedPlayers.set(roomId, player);
}

/**
 * 특정 방에서 의사가 보호한 플레이어를 가져옴
 * @param {string} roomId - 방 ID
 * @returns {string|null} 보호된 플레이어의 닉네임 또는 null
 */
function getSavedPlayer(roomId) {
  return savedPlayers.get(roomId);
}

/**
 * 특정 방에서 마피아가 암살한 플레이어를 설정
 * @param {string} roomId - 방 ID
 * @param {string} player - 암살된 플레이어의 닉네임
 */
function setKilledPlayer(roomId, player) {
  killedPlayers.set(roomId, player);
}

/**
 * 특정 방에서 마피아가 암살한 플레이어를 가져옴
 * @param {string} roomId - 방 ID
 * @returns {string|null} 암살된 플레이어의 닉네임 또는 null
 */
function getKilledPlayer(roomId) {
  return killedPlayers.get(roomId);
}

/**
 * 밤이 끝난 후 보호 및 암살 데이터를 초기화
 * @param {string} roomId - 방 ID
 */
function clearNightActions(roomId) {
  savedPlayers.delete(roomId);
  killedPlayers.delete(roomId);
}


// 외부에서 사용할 함수들을 모듈로 내보내기

export default {
  getGame,
  registerUser,
  unregisterUser,
  isHost,
  getUserCount,
  startGame,
  stopGame,
  proceedToPhase,
  getActiveUsers,
  // 의사 관련
  setSavedPlayer,
  getSavedPlayer,
  setKilledPlayer,
  getKilledPlayer,
  clearNightActions,
};
