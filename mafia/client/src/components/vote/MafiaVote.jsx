import React, { useState, useEffect } from "react";
import "../../styles/vote/MafiaVote.css";

const MafiaVote = ({ activePlayers, mafiaPlayers = [], onAssassinate, assassinationDone, username }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [votes, setVotes] = useState([]);

  const handleVote = (player) => {
    setVotes((prevVotes) => [...prevVotes, player]); // 새로운 투표를 추가
    setIsModalOpen(false);
  };

  // ✅ votes가 변경될 때마다 실행
  useEffect(() => {
    console.log('vote : ', votes);
    if (votes.length === 2) {
      const uniqueVotes = [...new Set(votes)]; // 중복된 플레이어 선택을 방지

      if (uniqueVotes.length === 1) {
        console.log(`암살된 플레이어: ${uniqueVotes[0]}`);
        onAssassinate(uniqueVotes[0]);
      } else {
        console.log("두 마피아가 서로 다른 플레이어를 선택했습니다. 무효 처리.");
      }

      setVotes([]); // 다음 투표를 위해 초기화
    }
  }, [votes]);

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)} className="btn mafia-vote-btn">
        마피아 투표
      </button>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>암살할 플레이어를 선택하세요!!</h3>
            <ul>
              {activePlayers.map((player, idx) => (
                <li key={idx}>
                  {player}
                  <button
                    disabled={assassinationDone || votes.includes(player)} 
                    onClick={() => {
                      console.log(`마피아가 선택한 사람: ${player}`);
                      handleVote(player);
                    }}
                  >
                    암살
                  </button>
                </li>
              ))}
            </ul>

            <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MafiaVote;
