// DoctorVote.jsx
import React from "react";

const DoctorVote = ({ activePlayers, onSave, saveDone }) => {
  return (
    <div className="doctor-panel">
      <h3>보호할 플레이어를 선택하세요</h3>
      <ul>
        {activePlayers.map((player, idx) => (
          <li key={idx}>
            {player}
            <button
              disabled={saveDone}
              onClick={() => onSave(player)} // 보호 요청 함수 호출
            >
              보호
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DoctorVote;
