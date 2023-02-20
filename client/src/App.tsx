import Chessboard from "./ChessGame";
import { GameBoard } from "./model/GameBoard";

const App = () => {
  const board = new GameBoard("8/8/8/8/8/5k2/4q3/7K b - - 0 1");

  return <Chessboard board={board} />;
};

export default App;
