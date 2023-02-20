import { GameBoard } from "./GameBoard";
import {
  BISHOP,
  Color,
  FLAGS,
  getRank,
  isPositionValid,
  KING,
  KNIGHT,
  Move,
  Ox88,
  PAWN,
  PieceType,
  QUEEN,
  reverseColor,
  ROOK,
  toAlgebraic,
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
function computeMovesOneIter(
  piece: Piece,
  board: GameBoard,
  offsets: number[]
): Move[] {
  const moves: Move[] = [];

  offsets.forEach(offset => {
    const nextPosition = piece.position + offset;

    if (!isPositionValid(nextPosition)) return;

    if (board.isSquareEmpty(nextPosition)) {
      moves.push({
        square: toAlgebraic(nextPosition),
        flags: FLAGS.NORMAL
      });
      return;
    }

    const pieceOnSquare = board.getPiece(nextPosition) as Piece;

    if (pieceOnSquare.color != piece.color)
      moves.push({
        square: toAlgebraic(nextPosition),
        flags: FLAGS.CAPTURE
      });
  });

  return moves;
}

// same thing but for bishop, rook and queen
function computeMovesMultipleIter(
  piece: Piece,
  board: GameBoard,
  offsets: number[]
): Move[] {
  const moves: Move[] = [];

  offsets.forEach(offset => {
    let nextPosition = piece.position + offset;

    while (isPositionValid(nextPosition)) {
      if (!board.isSquareEmpty(nextPosition)) {
        const pieceOnSquare = board.getPiece(nextPosition) as Piece;

        if (pieceOnSquare.color != piece.color) {
          moves.push({
            square: toAlgebraic(nextPosition),
            flags: FLAGS.CAPTURE
          });
        }

        break;
      }

      moves.push({
        square: toAlgebraic(nextPosition),
        flags: FLAGS.NORMAL
      });

      nextPosition += offset;
    }
  });

  return moves;
}

function getDirection(color: Color) {
  return color == WHITE ? -1 : 1;
}

export class Pawn extends Piece {
  static readonly OFFSETS = [16, 32];
  static readonly ATTACK_OFFSETS = [15, 17];

  static readonly STARTING_RANKS: Record<Color, number> = {
    w: getRank(Ox88["a2"]),
    b: getRank(Ox88["a7"])
  };

  static readonly PROMOTION_RANKS: Record<Color, number> = {
    w: getRank(Ox88["a8"]),
    b: getRank(Ox88["a1"])
  };

  constructor(color: Color, position: number) {
    super(color, position, PAWN);
  }

  private _computeNextPosition(offset: number) {
    return this.position + offset * getDirection(this.color);
  }

  getMoves(board: GameBoard): Move[] {
    const moves: Move[] = [];

    if (board.isSquareEmpty(this._computeNextPosition(Pawn.OFFSETS[0]))) {
      moves.push({
        square: toAlgebraic(this._computeNextPosition(Pawn.OFFSETS[0])),
        flags:
          getRank(this.position) == Pawn.PROMOTION_RANKS[this.color]
            ? FLAGS.PROMOTION
            : FLAGS.NORMAL
      });

      if (
        getRank(this.position) == Pawn.STARTING_RANKS[this.color] &&
        board.isSquareEmpty(this._computeNextPosition(Pawn.OFFSETS[1]))
      )
        moves.push({
          square: toAlgebraic(this._computeNextPosition(Pawn.OFFSETS[1])),
          flags: FLAGS.PAWN_JUMP
        });
    }

    Pawn.ATTACK_OFFSETS.forEach(offset => {
      const nextPosition = this._computeNextPosition(offset);

      if (board.isSquareEmpty(nextPosition)) {
        if (board.isEpSquare(nextPosition))
          moves.push({
            square: toAlgebraic(nextPosition),
            flags: FLAGS.CAPTURE
          });

        return;
      }

      const piece = board.getPiece(nextPosition) as Piece;

      if (this.color != piece.color) {
        moves.push({
          square: toAlgebraic(nextPosition),
          flags: FLAGS.CAPTURE
        });
      }
    });

    return moves;
  }
}

export class Knight extends Piece {
  static readonly OFFSETS = [-33, -31, -18, -14, 14, 18, 31, 33];

  constructor(color: Color, position: number) {
    super(color, position, KNIGHT);
  }

  getMoves(board: GameBoard): Move[] {
    return computeMovesOneIter(this, board, Knight.OFFSETS);
  }
}

export class Bishop extends Piece {
  static readonly OFFSETS = [-17, -15, 15, 17];

  constructor(color: Color, position: number) {
    super(color, position, BISHOP);
  }

  getMoves(board: GameBoard): Move[] {
    return computeMovesMultipleIter(this, board, Bishop.OFFSETS);
  }
}

export class Rook extends Piece {
  static readonly OFFSETS = [-16, -1, 1, 16];

  constructor(color: Color, position: number) {
    super(color, position, ROOK);
  }

  getMoves(board: GameBoard): Move[] {
    return computeMovesMultipleIter(this, board, Rook.OFFSETS);
  }
}

export class Queen extends Piece {
  static readonly OFFSETS = [-17, -16, -15, -1, 1, 15, 16, 17];

  constructor(color: Color, position: number) {
    super(color, position, QUEEN);
  }

  getMoves(board: GameBoard): Move[] {
    return computeMovesMultipleIter(this, board, Queen.OFFSETS);
  }
}

export class King extends Piece {
  static readonly OFFSETS = [-17, -16, -15, -1, 1, 15, 16, 17];

  constructor(color: Color, position: number) {
    super(color, position, KING);
  }

  // TODO: current implementation lets kings get near each other
  getMoves(board: GameBoard): Move[] {
    return computeMovesOneIter(this, board, Queen.OFFSETS)
      .filter(
        ({ square }) =>
          !board.isSquareAttacked(Ox88[square], reverseColor(this.color))
      )
      .concat(board.getCastlingRights(this.color, this.position));
  }
}
