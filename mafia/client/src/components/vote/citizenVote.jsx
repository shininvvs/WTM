import React from "react";

const CitizenVote = ({ activePlayers, onVote, voteDone, username }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>마피아라고 생각하는 사람을 선택하세요</h3>
        <ul>
          {activePlayers
            .filter((player) => player !== username) // 자기 자신 제외
            .map((player, idx) => (
              <li key={idx}>
                {player}
                <button
                  disabled={voteDone} // 투표했으면 비활성화
                  onClick={() => onVote(player)}
                  style={{ marginLeft: "10px" }}
                >
                  투표
                </button>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default CitizenVote;
