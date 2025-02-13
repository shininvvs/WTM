// MafiaVote.jsx
import React from "react";

const MafiaVote = ({ activePlayers, onAssassinate, assassinationDone, username }) => {
  return (
    <div className="mafia-panel">
      <h3>암살할 플레이어를 선택하세요</h3>
      <ul>
        {activePlayers
          .filter((player) => player !== username) // 자신은 제외
          .map((player, idx) => (
            <li key={idx}>
              {player}
              <button
                disabled={assassinationDone}
                onClick={() => onAssassinate(player)} // 암살 요청 함수 호출
              >
                암살
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default MafiaVote;
