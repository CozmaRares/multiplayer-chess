import {
  BISHOP,
  Color,
  KNIGHT,
  Move,
  Ox88,
  PAWN,
  PieceType,
  WHITE
} from "./constants";
import { GameBoard } from "./GameBoard";

abstract class Piece {
  public readonly _color: Color;
  public readonly _type: PieceType;
  public readonly _position: number;

  constructor(color: Color, position: number, type: PieceType) {
    this._type = type;
    this._color = color;
    this._position = position;
  }

  abstract getMoves(board: GameBoard): Move[];
}

class OneIter {
  static computeMoves(
    piece: Piece,
    board: GameBoard,
    offsets: number[]
  ): Move[] {
    throw new Error("Method not implemented.");
  }
}

class MultipleIter {
  static computeMoves(
    piece: Piece,
    board: GameBoard,
    offsets: number[]
  ): Move[] {
    throw new Error("Method not implemented.");
  }
}

function getDirection(color: Color) {
  return color == WHITE ? -1 : 1;
}

export class Pawn extends Piece {
  static readonly OFFSETS = [16, 32];
  static readonly ATTACK_OFFSETS = [15, 17];

  // prettier-ignore
  static readonly STARTING_RANKS = {
    w: [
      Ox88["a2"], Ox88["b2"], Ox88["c2"], Ox88["d2"], Ox88["e2"], Ox88["f2"], Ox88["g2"], Ox88["h2"]
    ],
    b: [
      Ox88["a7"], Ox88["b7"], Ox88["c7"], Ox88["d7"], Ox88["e7"], Ox88["f7"], Ox88["g7"], Ox88["h7"]
    ]
  };

  constructor(color: Color, position: number) {
    super(color, position, PAWN);
  }

  getMoves(board: GameBoard): Move[] {
    throw new Error("Method not implemented.");
  }
}

export class Knight extends Piece {
  static readonly OFFSETS = [-18, -33, -31, -14, 18, 33, 31, 14];

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
    return OneIter.computeMoves(this, board, Queen.OFFSETS);
  }
}
