import { Piece } from "./pieces";
import { Color, TODO } from "./utils";

export class GameBoard {
  isSquareAttacked(square: number, attackedBy: Color): boolean {
    TODO("GameBoard.isSquareAttacked");
    return false;
  }

  isSquareEmpty(square: number): boolean {
    TODO("GameBoard.isSquareEmpty");
    return false;
  }

  getPiece(square: number): Piece {
    TODO("GameBoard.getPiece");
    return {} as Piece;
  }
}
