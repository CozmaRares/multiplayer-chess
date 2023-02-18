export const WHITE = "w";
export const BLACK = "b";

export type Color = "w" | "b";

export const PAWN = "p";
export const KNIGHT = "n";
export const BISHOP = "b";
export const ROOK = "r";
export const QUEEN = "q";
export const KING = "k";

export const PIECE_SYMBOLS = "pnkrqkPNKRQK";

export type PieceType = "p" | "n" | "b" | "r" | "q" | "k";

export const EMPTY = -1;

// prettier-ignore
export const SQUARES = [
  'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1',
  'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2',
  'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3',
  'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4',
  'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5',
  'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6',
  'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7',
  'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8',
] as const;

export type Square = typeof SQUARES[number];

export const FLAGS = {
  NORMAL: "n",
  CAPTURE: "c",
  PAWN_MOVE: "m",
  PAWN_JUMP: "j",
  PROMOTION: "p",
  K_SIDE_CASTLE: "k",
  Q_SIDE_CASTLE: "q"
};

// prettier-ignore
export const FLAG_MASKS = {
  NORMAL:        0b0000001,
  CAPTURE:       0b0000010,
  PAWN_MOVE:     0b0000100,
  PAWN_JUMP:     0b0001000,
  PROMOTION:     0b0010000,
  K_SIDE_CASTLE: 0b0100000,
  Q_SIDE_CASTLE: 0b1000000
};

// prettier-ignore
export const Ox88: Record<Square, number> = {
  a8: 0x00, b8: 0x01, c8: 0x02, d8: 0x03, e8: 0x04, f8: 0x05, g8: 0x06, h8: 0x07,
  a7: 0x10, b7: 0x11, c7: 0x12, d7: 0x13, e7: 0x14, f7: 0x15, g7: 0x16, h7: 0x17,
  a6: 0x20, b6: 0x21, c6: 0x22, d6: 0x23, e6: 0x24, f6: 0x25, g6: 0x26, h6: 0x27,
  a5: 0x30, b5: 0x31, c5: 0x32, d5: 0x33, e5: 0x34, f5: 0x35, g5: 0x36, h5: 0x37,
  a4: 0x40, b4: 0x41, c4: 0x42, d4: 0x43, e4: 0x44, f4: 0x45, g4: 0x46, h4: 0x47,
  a3: 0x50, b3: 0x51, c3: 0x52, d3: 0x53, e3: 0x54, f3: 0x55, g3: 0x56, h3: 0x57,
  a2: 0x60, b2: 0x61, c2: 0x62, d2: 0x63, e2: 0x64, f2: 0x65, g2: 0x66, h2: 0x67,
  a1: 0x70, b1: 0x71, c1: 0x72, d1: 0x73, e1: 0x74, f1: 0x75, g1: 0x76, h1: 0x77,
};

export type Move = {
  color: Color;
  from: Square;
  to: Square;
  piece: PieceType;
  captured?: PieceType;
  promotion?: PieceType;
  flags: string;
  san: string;
};

export const DEFAULT_POSITION =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
