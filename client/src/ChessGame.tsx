import { useCallback, useMemo, useState } from "react";
import Show from "./components/Show";
import useWindowDimensions from "./hooks/useWindowDimensions";
import { GameBoard } from "./model/GameBoard";
import {
  Color,
  EMPTY,
  getRank,
  isPositionValid,
  PieceType,
  to0x88
} from "./model/utils";

import wb from "./assets/pieces/wb.png";
import wk from "./assets/pieces/wk.png";
import wn from "./assets/pieces/wn.png";
import wp from "./assets/pieces/wp.png";
import wq from "./assets/pieces/wq.png";
import wr from "./assets/pieces/wr.png";

import bb from "./assets/pieces/bb.png";
import bk from "./assets/pieces/bk.png";
import bn from "./assets/pieces/bn.png";
import bp from "./assets/pieces/bp.png";
import bq from "./assets/pieces/bq.png";
import br from "./assets/pieces/br.png";
import { Piece } from "./model/pieces";

const SQUARE_COLORS = {
  light: "#ECECD7",
  dark: "#4D6D92"
};

const MIN_SIZE = 480;
const MAX_SIZE = 720;

const PIECE_IMAGES: Record<Color, Record<string, string>> = {
  w: { p: wp, n: wn, b: wb, r: wr, q: wq, k: wk },
  b: { p: bp, n: bn, b: bb, r: br, q: bq, k: bk }
};

// TODO: figure out why it doesn't render
const ChessGame: React.FC<{
  fen: string;
}> = props => {
  const board = useMemo(() => new GameBoard(props.fen), [props.fen]);

  return <Chessboard board={board} />;
};

// export default ChessGame;

const Chessboard: React.FC<{
  board: GameBoard;
  blackPerspective?: boolean;
  size?: number;
  onMove?: unknown; // TODO: onMove non optional callback function
}> = props => {
  const [selectedSquare, setSelectedSquare] = useState(-1);
  const { windowHeight, windowWidth } = useWindowDimensions();

  const pieces = props.board.board.filter((_, idx) => isPositionValid(idx));
  const isReversed = props.blackPerspective ?? false;

  if (isReversed) pieces.reverse();

  const tileSize =
    constrain(
      props.size ?? MAX_SIZE,
      MIN_SIZE,
      Math.min(MAX_SIZE, windowHeight, windowWidth)
    ) / 8;

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      selectSquare(e, selectedSquare, setSelectedSquare, props.board);
    },
    [selectedSquare, props.board.fen]
  );

  const moves = new Array<boolean>(64).fill(false);

  if (selectedSquare != EMPTY) {
    const piece = props.board.getPiece(selectedSquare) as Piece;

    piece.getMoves(props.board).forEach(move => {
      let idx = to0x88(move.square);

      idx -= 8 * (7 - getRank(idx));

      moves[idx] = true;
    });
  }

  let square = 0;

  return (
    <div
      className="grid grid-cols-8 border-2 border-black w-fit"
      onPointerDown={onPointerDown}
      key={props.board.fen}
    >
      {pieces.map((piece, idx) => (
        <Tile
          key={idx}
          isReversed={isReversed}
          size={tileSize}
          tileNumber={square++}
          selected={(piece?.position ?? -2) == selectedSquare}
          pieceType={piece?.type}
          pieceColor={piece?.color}
          piecePosition={piece?.position}
          canMoveTo={moves[idx]}
        />
      ))}
    </div>
  );
};

export default Chessboard;

const Tile: React.FC<{
  isReversed: boolean;
  size: number;
  tileNumber: number;
  selected: boolean;
  canMoveTo: boolean;
  pieceType?: string;
  pieceColor?: string;
  piecePosition?: number;
}> = props => {
  const rank = Math.floor(props.tileNumber / 8);
  const file = props.tileNumber % 8;

  const color = props.pieceColor as Color | undefined;
  const type = props.pieceType as PieceType | undefined;

  const imgSrc = toImgSrc(color, type);

  return (
    <div
      className="aspect-square flex items-center justify-center bg-transparent relative isolate group"
      style={{
        backgroundColor:
          isEven(file + rank) == props.isReversed
            ? SQUARE_COLORS.dark
            : SQUARE_COLORS.light,
        width: `${props.size}px`
      }}
      data-position={props.piecePosition}
      data-move={props.canMoveTo}
    >
      <Show when={props.canMoveTo}>
        <Show when={imgSrc == undefined}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[33%] group-hover:w-[39%] rounded-full aspect-square bg-neutral-900 bg-opacity-50 pointer-events-none transition-[width]" />
        </Show>
        <Show when={imgSrc != undefined}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] rounded-full aspect-square bg-neutral-900 bg-opacity-50 pointer-events-none transition-[width]" />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] rounded-full aspect-square pointer-events-none"
            style={{
              backgroundColor:
                isEven(file + rank) == props.isReversed
                  ? SQUARE_COLORS.dark
                  : SQUARE_COLORS.light
            }}
          />
        </Show>
      </Show>
      <Show when={props.selected}>
        <div className="pointer-events-none absolute left-0 top-0 right-0 bottom-0 bg-red-400"></div>
      </Show>
      <Show when={imgSrc != undefined}>
        <img src={imgSrc} className="pointer-events-none w-[95%] z-10" />
      </Show>
      <Show when={file == 0}>
        <span
          className="absolute top-0.5 left-0.5 font-bold pointer-events-none"
          style={{
            color:
              isEven(file + rank) == props.isReversed
                ? SQUARE_COLORS.light
                : SQUARE_COLORS.dark,
            fontSize: `${props.size * 0.2}px`
          }}
        >
          {props.isReversed ? rank + 1 : 8 - rank}
        </span>
      </Show>
      <Show when={rank == 7}>
        <span
          className="absolute bottom-0.5 right-1 font-bold pointer-events-none"
          style={{
            color:
              isEven(file + rank) == props.isReversed
                ? SQUARE_COLORS.light
                : SQUARE_COLORS.dark,
            fontSize: `${props.size * 0.2}px`
          }}
        >
          {"abcdefgh"[file]}
        </span>
      </Show>
    </div>
  );
};

function toImgSrc(color?: Color, type?: PieceType) {
  if (color == undefined || type == undefined) return;

  return PIECE_IMAGES[color][type];
}

function constrain(value: number, min: number, max: number) {
  return value > max ? max : value < min ? min : value;
}

function isEven(x: number) {
  return x % 2 == 0;
}

function selectSquare(
  e: React.PointerEvent,
  selectedSquare: number,
  setSelectedSquare: React.Dispatch<React.SetStateAction<number>>,
  board: GameBoard
): void {
  const element = e.target as HTMLElement;

  if (element.dataset.position == undefined) return setSelectedSquare(EMPTY);

  const square = parseInt(element.dataset.position as string);

  const piece = board.getPiece(square);

  if (piece == null) return setSelectedSquare(EMPTY);

  if (board.turn != piece.color) return setSelectedSquare(EMPTY);

  const moves = piece.getMoves(board);

  if (moves.length == 0) return setSelectedSquare(EMPTY);

  setSelectedSquare(square);

  // TODO: unfinished
}
