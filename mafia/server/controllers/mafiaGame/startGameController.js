import { updateGameState } from "../../services/mafiaGame/startGameService.js";

// 게임 시작 요청을 처리하는 컨트롤러
const startGame = async (req, res) => {
    const roomId = req.params.roomId;   
     console.log('게임 시작할 방 id:', roomId);
  try {
    const result = await updateGameState(roomId);
    if (result) {
      res.status(200).json({success: true, message: 'Game started successfully' });
    } else {
      res.status(400).json({success: false, message: 'Failed to start the game' });
    }
  } catch (error) {
    console.error('Error starting game:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export {startGame};