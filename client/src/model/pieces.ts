import { GameBoard } from "./GameBoard";
import {
  BISHOP,
  Color,
  FLAGS,
  isPositionValid,
  KNIGHT,
  Move,
  Ox88,
  PAWN,
  PieceType,
  reverseColor,
  toAlgebraic,
  TODO,
  WHITE
} from "./utils";

export abstract class Piece {
  public readonly color: Color;
  public readonly type: PieceType;
  public readonly position: number;

  constructor(color: Color, position: number, type: PieceType) {
    this.type = type;
    this.color = color;
    this.position = position;
  }

  abstract getMoves(board: GameBoard): Move[];
}

// for pieces that need only one iteration / offset
// king and knight
class OneIter {
  static computeMoves(
    piece: Piece,
    board: GameBoard,
    offsets: number[]
  ): Move[] {
    const moves: Move[] = [];

    offsets.forEach(offset => {
      const newPosition = piece.position + offset;

      if (!isPositionValid(newPosition)) return;

      if (board.isSquareEmpty(newPosition)) {
        moves.push({
          square: toAlgebraic(newPosition),
          flags: FLAGS.NORMAL
        });
        return;
      }

      const pieceOnSquare = board.getPiece(newPosition);

      if (pieceOnSquare.color != piece.color)
        moves.push({
          square: toAlgebraic(newPosition),
          flags: FLAGS.CAPTURE
        });
    });

    return moves;
  }
}

// same thing but for bishop, rook and queen
class MultipleIter {
  static computeMoves(
    piece: Piece,
    board: GameBoard,
    offsets: number[]
  ): Move[] {
    const moves: Move[] = [];

    offsets.forEach(offset => {
      let newPosition = piece.position + offset;

      while (isPositionValid(newPosition)) {
        if (!board.isSquareEmpty(newPosition)) {
          const pieceOnSquare = board.getPiece(newPosition);

          if (pieceOnSquare.color != piece.color) {
            moves.push({
              square: toAlgebraic(newPosition),
              flags: FLAGS.CAPTURE
            });
          }

          break;
        }

        moves.push({
          square: toAlgebraic(newPosition),
          flags: FLAGS.NORMAL
        });

        newPosition += offset;
      }
    });

    return moves;
  }
}

function getDirection(color: Color) {
  return color == WHITE ? -1 : 1;
}

export class Pawn extends Piece {
  static readonly OFFSETS = [16, 32];
  static readonly ATTACK_OFFSETS = [15, 17];

  static readonly STARTING_RANKS = {
    w: 2,
    b: 7
  };

  constructor(color: Color, position: number) {
    super(color, position, PAWN);
  }

  getMoves(board: GameBoard): Move[] {
    TODO("Pawn.getMoves");
    return [] as Move[];
  }
}

export class Knight extends Piece {
  static readonly OFFSETS = [-33, -31, -18, -14, 14, 18, 31, 33];

  constructor(color: Color, position: number) {
    super(color, position, KNIGHT);
  }

  getMoves(board: GameBoard): Move[] {
    return OneIter.computeMoves(this, board, Knight.OFFSETS);
  }
}

export class Bishop extends Piece {
  static readonly OFFSETS = [-17, -15, 15, 17];

  constructor(color: Color, position: number) {
    super(color, position, BISHOP);
  }

  getMoves(board: GameBoard): Move[] {
    return MultipleIter.computeMoves(this, board, Bishop.OFFSETS);
  }
}

export class Rook extends Piece {
  static readonly OFFSETS = [-16, -1, 1, 16];

  constructor(color: Color, position: number) {
    super(color, position, BISHOP);
  }

  getMoves(board: GameBoard): Move[] {
    return MultipleIter.computeMoves(this, board, Rook.OFFSETS);
  }
}

export class Queen extends Piece {
  static readonly OFFSETS = [-17, -16, -15, -1, 1, 15, 16, 17];

  constructor(color: Color, position: number) {
    super(color, position, BISHOP);
  }

  getMoves(board: GameBoard): Move[] {
    return MultipleIter.computeMoves(this, board, Queen.OFFSETS);
  }
}

export class King extends Piece {
  static readonly OFFSETS = [-17, -16, -15, -1, 1, 15, 16, 17];

  constructor(color: Color, position: number) {
    super(color, position, BISHOP);
  }

  getMoves(board: GameBoard): Move[] {
    return OneIter.computeMoves(this, board, Queen.OFFSETS).filter(
      ({ square }) =>
        !board.isSquareAttacked(Ox88[square], reverseColor(this.color))
    );
  }
}
