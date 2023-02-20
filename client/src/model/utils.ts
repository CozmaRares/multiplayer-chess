export const WHITE = "w";
export const BLACK = "b";

export type Color = typeof WHITE | typeof BLACK;

export function reverseColor(color: Color) {
  return color == WHITE ? BLACK : WHITE;
}

export const PAWN = "p";
export const KNIGHT = "n";
export const BISHOP = "b";
export const ROOK = "r";
export const QUEEN = "q";
export const KING = "k";

export const PROMOTIONS = [KNIGHT, BISHOP, ROOK, QUEEN] as const;

export const PIECE_SYMBOLS = "pnkrqkPNKRQK";

export type PieceType =
  | typeof PAWN
  | typeof KNIGHT
  | typeof BISHOP
  | typeof ROOK
  | typeof QUEEN
  | typeof KING;

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
  NORMAL:        0b000001,
  CAPTURE:       0b000010,
  PAWN_JUMP:     0b000100,
  PROMOTION:     0b001000,
  K_SIDE_CASTLE: 0b010000,
  Q_SIDE_CASTLE: 0b100000
};

export type Move = {
  square: Square;
  flags: number;
};

export const DEFAULT_POSITION =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

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

export function toAlgebraic(square: number): Square {
  const f = getFile(square);
  const r = getRank(square);
  return ("abcdefgh"[f] + "12345678"[r]) as Square;
}

export function to0x88(square: Square): number {
  return ("87654321".indexOf(square[1]) << 4) + "abcdefgh".indexOf(square[0]);
}

export function getRank(position: number) {
  return 7 - (position >> 4);
}

export function getFile(position: number) {
  return position & 0x7;
}

export function isPositionValid(position: number) {
  return (position & 0x88) == 0;
}

export function validateFen(fen: string) {
  const fields = fen.split(/\s+/);

  // 6 fields
  if (fields.length !== 6) {
    return {
      ok: false,
      error: "Invalid FEN: must contain six space delimited fields"
    };
  }

  try {
    // in order of how easy it is to verify the fields
    validateFenField5(fields[4]);
    validateFenField6(fields[5]);
    validateFenField3(fields[2]);
    validateFenField2(fields[1]);
    validateFenField4(fields[3], fields[1]);
    validateFenField1(fields[0]);
  } catch (err) {
    return { ok: false, error: err };
  }

  return { ok: true };
}

function validateFenField1(position: string) {
  // 1 king for each color
  const kings = [
    { color: "white", regex: /K/g },
    { color: "black", regex: /k/g }
  ];

  for (const { color, regex } of kings) {
    const matches = position.match(regex) || [];

    if (matches.length == 0) throw `Invalid FEN: missing ${color} king`;

    if (matches.length > 1) throw `Invalid FEN: too many ${color} kings`;
  }

  // position has 8 rows
  const rows = position.split("/");
  if (rows.length !== 8)
    throw "Invalid FEN: board position does not contain 8 fields delimited by '/'";

  // all rows are valid
  for (let i = 0; i < rows.length; i++) {
    let squares = 0;
    let previousWasNumber = false;

    for (let k = 0; k < rows[i].length; k++) {
      if (/\d/.test(rows[i][k])) {
        if (previousWasNumber)
          throw "Invalid FEN: board position is invalid, contains consecutive numbers";

        squares += parseInt(rows[i][k]);
        previousWasNumber = true;
        continue;
      }

      if (!/^[prnbqkPRNBQK]$/.test(rows[i][k]))
        throw "Invalid FEN: board position is invalid, contains an invalid piece";

      squares += 1;
      previousWasNumber = false;
    }

    if (squares !== 8)
      throw "Invalid FEN: board position is invalid, has too many squares on a row";
  }
}

function validateFenField2(turn: string) {
  if (!/^(w|b)$/.test(turn)) throw "Invalid FEN: side-to-move is invalid";
}

function validateFenField3(castling: string) {
  if (/[^kKqQ-]/.test(castling))
    throw "Invalid FEN: castling availability is invalid";
}

function validateFenField4(epSquare: string, turn: string) {
  if (!/^(-|[abcdefgh][36])$/.test(epSquare))
    throw "Invalid FEN: en-passant square is invalid";

  if (
    (epSquare[1] == "3" && turn == "w") ||
    (epSquare[1] == "6" && turn == "b")
  )
    throw "Invalid FEN: illegal en-passant square";
}

function validateFenField5(halfMoves: string) {
  const err =
    "Invalid FEN: the number of half moves must be a non-negative integer";

  if (/\D/.test(halfMoves)) throw err;

  const number = parseInt(halfMoves);

  if (isNaN(number) || number < 0) throw err;
}

function validateFenField6(fullMoves: string) {
  const err =
    "Invalid FEN: the number of full moves must be a positive integer";

  if (/\D/.test(fullMoves)) throw err;

  const number = parseInt(fullMoves);

  if (isNaN(number) || number <= 0) throw err;
}
