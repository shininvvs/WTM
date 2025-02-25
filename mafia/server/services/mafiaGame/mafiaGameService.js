// src/services/mafiaGame/mafiaGameService.js

const games = new Map();

// 게임 각 단계의 지속 시간 (초 단위)
const NIGHT_DURATION = 10;
const DAY_DURATION = 5;
const VOTING_DURATION = 5;
const REBUTTAL_DURATION = 5;
const FINAL_VOTING_DURATION = 5;

const gamePhases = [
  { name: "night", duration: NIGHT_DURATION },
  { name: "day", duration: DAY_DURATION },
  { name: "voting", duration: VOTING_DURATION },
  { name: "rebuttal", duration: REBUTTAL_DURATION },
  { name: "finalVoting", duration: FINAL_VOTING_DURATION },
];

/**
 * 지정된 roomId의 게임 상태 객체를 반환합니다.
 * 없으면 새로 생성하여 반환합니다.
 * @param {string} roomId 
 * @returns {object} 게임 상태 객체
 */
function getGame(roomId) {
  if (!games.has(roomId)) {
    games.set(roomId, {
      activeUsers: new Map(),
      hostUsername: null,
      gameStarted: false,
      gameInProgress: false,
      currentPhaseIndex: 0,
      phaseTimer: null,
      phaseStartTime: null,
      phaseDurationMs: null,
      phaseEndTime: null, // 절대 종료 시각 추가
      savedPlayer: null,
      killedPlayer: null,
      onPhaseChanged: null,
    });
  }
  return games.get(roomId);
}

/**
 * 지정된 룸에 사용자를 등록합니다.
 * 첫 번째 등록된 사용자가 방장으로 지정됩니다.
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
    role: null,
    isHost: username === game.hostUsername,
    investigated: false,
    saved: false,
    skipUsed: false,
    extendUsed: false,
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
 * 지정된 룸에서 주어진 사용자가 방장인지 확인합니다.
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
 * 지정된 룸의 활성 사용자 정보를 반환합니다.
 * @param {string} roomId 
 * @returns {Map}
 */
function getActiveUsers(roomId) {
  return getGame(roomId).activeUsers;
}

/**
 * Fisher-Yates 알고리즘을 사용하여 배열을 무작위로 섞습니다.
 * @param {Array} arr 배열
 */
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/**
 * 지정된 룸의 사용자들에게 무작위로 역할을 배정합니다.
 * @param {string} roomId 
 */
function assignRoles(roomId) {
  const game = getGame(roomId);
  const playerCount = game.activeUsers.size;
  let mafiaCount = 0, policeCount = 0, doctorCount = 0;
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
  let players = Array.from(game.activeUsers.keys());
  shuffleArray(players);
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
 * 역할 배정을 수행하고 게임 진행 상태를 업데이트합니다.
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
 * 진행 중인 타이머를 클리어하고 게임 상태를 초기화합니다.
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
 * 현재 진행 중인 게임 단계의 이름을 반환합니다.
 * @param {string} roomId 
 * @returns {string} 현재 페이즈 이름
 */
function getCurrentPhaseName(roomId) {
  const game = getGame(roomId);
  return gamePhases[game.currentPhaseIndex].name;
}

/**
 * 게임 단계를 진행시키는 함수.
 * 각 단계의 지속 시간 후 다음 단계로 전환하며, onPhaseChanged 콜백을 호출합니다.
 * @param {string} roomId 
 * @param {function} onPhaseChanged 단계 변경 시 호출할 콜백 (phase 객체 전달)
 */
function proceedToPhase(roomId, onPhaseChanged) {
  const game = getGame(roomId);
  if (!game.gameInProgress) return;

  const phase = gamePhases[game.currentPhaseIndex];
  game.phaseStartTime = Date.now();
  game.phaseDurationMs = phase.duration * 1000;
  game.phaseEndTime = game.phaseStartTime + game.phaseDurationMs; // 종료 시각 기록

  if (game.phaseTimer) clearTimeout(game.phaseTimer);

  // 각 단계에서 모든 사용자의 skipUsed와 extendUsed 초기화 및, 밤일 경우 경찰 조사 초기화
  game.activeUsers.forEach((user) => {
    user.skipUsed = false;
    user.extendUsed = false;
    if (phase.name === "night" && user.role === "경찰") {
      user.investigated = false;
    }
  });

  if (typeof onPhaseChanged === "function") onPhaseChanged(phase);

  game.phaseTimer = setTimeout(() => {
    game.currentPhaseIndex = (game.currentPhaseIndex + 1) % gamePhases.length;
    proceedToPhase(roomId, onPhaseChanged);
  }, game.phaseDurationMs);
}

/**
 * 각 사용자가 시간 스킵(5초 단축)을 요청할 때 호출되는 함수.
 * 각 사용자는 각 페이즈마다 한 번만 사용할 수 있습니다.
 * 남은 시간이 5초 이하라면 즉시 다음 단계로 전환합니다.
 * @param {string} roomId 
 * @param {string} username 
 * @param {number} skipAmountMs (기본값: 5000ms)
 * @returns {number|null} 새로운 남은 시간(ms) 또는 0 (즉시 전환) 또는 null (이미 사용한 경우 또는 day가 아닐 경우)
 */
function skipPhaseTime(roomId, username, skipAmountMs = 5000) {
  const game = getGame(roomId);
  const currentPhaseName = gamePhases[game.currentPhaseIndex].name;
  if (currentPhaseName !== "day") {
    return null;
  }

  const user = game.activeUsers.get(username);
  if (!user) return null;
  if (user.skipUsed) return null;
  user.skipUsed = true;

  let remaining = game.phaseEndTime - Date.now();
  remaining -= skipAmountMs;

  if (remaining <= 0) {
    clearTimeout(game.phaseTimer);
    game.currentPhaseIndex = (game.currentPhaseIndex + 1) % gamePhases.length;
    if (game.onPhaseChanged) {
      proceedToPhase(roomId, game.onPhaseChanged);
    }
    return 0;
  } else {
    // 업데이트된 남은 시간을 기준으로 새로운 종료 시각 설정
    game.phaseEndTime = Date.now() + remaining;
    clearTimeout(game.phaseTimer);
    game.phaseTimer = setTimeout(() => {
      game.currentPhaseIndex = (game.currentPhaseIndex + 1) % gamePhases.length;
      if (game.onPhaseChanged) {
        proceedToPhase(roomId, game.onPhaseChanged);
      }
    }, remaining);
    return remaining;
  }
}

/**
 * 각 사용자가 시간 확장(5초 증가)을 요청할 때 호출되는 함수.
 * 단, 확장은 'day' 페이즈에서만 가능하도록 제한합니다.
 * @param {string} roomId 
 * @param {string} username 
 * @param {number} extendAmountMs (기본값: 5000ms)
 * @returns {number|null} 새로운 남은 시간(ms) 또는 null (이미 사용한 경우 또는 day가 아닐 경우)
 */
function extendPhaseTime(roomId, username, extendAmountMs = 5000) {
  const game = getGame(roomId);
  const currentPhaseName = gamePhases[game.currentPhaseIndex].name;
  if (currentPhaseName !== "day") {
    return null;
  }
  const user = game.activeUsers.get(username);
  if (!user) return null;
  if (user.extendUsed) return null;
  user.extendUsed = true;

  let remaining = game.phaseEndTime - Date.now();
  remaining += extendAmountMs;

  // 업데이트된 남은 시간을 기준으로 새로운 종료 시각 설정
  game.phaseEndTime = Date.now() + remaining;
  clearTimeout(game.phaseTimer);
  game.phaseTimer = setTimeout(() => {
    game.currentPhaseIndex = (game.currentPhaseIndex + 1) % gamePhases.length;
    if (game.onPhaseChanged) {
      proceedToPhase(roomId, game.onPhaseChanged);
    }
  }, remaining);
  return remaining;
}

export default {
  getGame,
  registerUser,
  unregisterUser,
  isHost,
  getUserCount,
  getActiveUsers,
  assignRoles,
  startGame,
  stopGame,
  proceedToPhase,
  skipPhaseTime,
  extendPhaseTime,
  getCurrentPhaseName
};

export { proceedToPhase, skipPhaseTime, extendPhaseTime };
