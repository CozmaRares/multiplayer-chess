import { Bishop, King, Knight, Pawn, Piece, Queen, Rook } from "./pieces";
import {
  BISHOP,
  BLACK,
  Color,
  DEFAULT_POSITION,
  EMPTY,
  FLAGS,
  KING,
  KNIGHT,
  Move,
  Ox88,
  PAWN,
  PieceType,
  QUEEN,
  reverseColor,
  ROOK,
  Square,
  to0x88,
  toAlgebraic,
  validateFen,
  WHITE
} from "./utils";

export class GameBoard {
  readonly fen: string;
  readonly board: (Piece | null)[];
  readonly turn: Color;
  readonly castling: Record<Color, number>;
  readonly epSquare: number;
  readonly halfMoves: number;
  readonly fullMoves: number;
  readonly attacks: string[];
  readonly kings: Record<Color, King | null>;

  constructor(fen = DEFAULT_POSITION) {
    this.fen = fen;

    this.board = new Array<Piece | null>(128).fill(null);

    this.kings = { w: null, b: null };

    const fields = fen.split(/\s+/);

    const { ok, error } = validateFen(fen);

    if (!ok) throw new Error(error as string);

    const position = fields[0];
    let square = 0;

    for (let i = 0; i < position.length; i++) {
      const piece = position[i];

      if (piece == "/") {
        square += 8;
        continue;
      }

      if (/\d/.test(piece)) {
        square += parseInt(piece);
        continue;
      }

      const color = piece < "a" ? WHITE : BLACK;

      this._put(square, {
        type: piece.toLocaleLowerCase() as PieceType,
        color
      });

      square++;
    }

    this.turn = fields[1] as Color;

    this.castling = { w: 0, b: 0 };

    if (fields[2].indexOf("K") > -1) this.castling.w |= FLAGS.K_SIDE_CASTLE;

    if (fields[2].indexOf("Q") > -1) this.castling.w |= FLAGS.Q_SIDE_CASTLE;

    if (fields[2].indexOf("k") > -1) this.castling.b |= FLAGS.K_SIDE_CASTLE;

    if (fields[2].indexOf("q") > -1) this.castling.b |= FLAGS.Q_SIDE_CASTLE;

    this.epSquare = fields[3] == "-" ? EMPTY : Ox88[fields[3] as Square];
    this.halfMoves = parseInt(fields[4]);
    this.fullMoves = parseInt(fields[5]);

    this.attacks = new Array<string>(128).fill("");

    this.board.forEach(piece => {
      if (piece == null) return;

      if (piece.type == KING) return;

      piece.getMoves(this).forEach(move => {
        const square = to0x88(move.square);

        // TODO: refactor colors to bit masks
        this.attacks[square] += piece.color;
      });
    });
  }

  private _put(
    square: number,
    { type, color }: { type: PieceType; color: Color }
  ) {
    let p: Piece;

    switch (type) {
      case PAWN:
        p = new Pawn(color, square);
        break;
      case KNIGHT:
        p = new Knight(color, square);
        break;
      case BISHOP:
        p = new Bishop(color, square);
        break;
      case ROOK:
        p = new Rook(color, square);
        break;
      case QUEEN:
        p = new Queen(color, square);
        break;
      case KING:
        p = new King(color, square);
        break;
    }

    this.board[square] = p;
  }

  isSquareAttacked(square: number, attackedBy: Color): boolean {
    return this.attacks[square].indexOf(attackedBy) != -1;
  }

  isSquareEmpty(square: number): boolean {
    return this.board[square] == null;
  }

  getPiece(square: number): Piece | null {
    return this.board[square];
  }

  private _canCastleThrough(square: number, color: Color) {
    return (
      this.isSquareEmpty(square) &&
      this.isSquareAttacked(square, reverseColor(color))
    );
  }

  getCastlingRights(color: Color, kingPosition: number): Move[] {
    const castling = this.castling[color];

    const moves: Move[] = [];

    if (
      castling & FLAGS.K_SIDE_CASTLE &&
      this._canCastleThrough(kingPosition + 1, color) &&
      this._canCastleThrough(kingPosition + 2, color)
    )
      moves.push({
        square: toAlgebraic(kingPosition + 2),
        flags: FLAGS.K_SIDE_CASTLE
      });

    if (
      castling & FLAGS.Q_SIDE_CASTLE &&
      this._canCastleThrough(kingPosition - 1, color) &&
      this._canCastleThrough(kingPosition - 2, color) &&
      this._canCastleThrough(kingPosition - 3, color)
    )
      moves.push({
        square: toAlgebraic(kingPosition - 2),
        flags: FLAGS.Q_SIDE_CASTLE
      });

    return moves;
  }

  isEpSquare(square: number): boolean {
    return this.epSquare == square;
  }
}
