import { useCallback, useEffect, useState } from "react";
import { SOCKET_EVENTS } from "../../../server/src/socketEvents";
import * as ListenerTypes from "../../../server/src/socketListenerArgTypes";
import { GameBoard } from "../model/GameBoard";
import { Piece } from "../model/pieces";
import {
  Color,
  EMPTY,
  getFile,
  getRank,
  isPositionValid,
  PieceType,
  to0x88,
  toAlgebraic
} from "../model/utils";
import Show from "../Show";
import useSocket from "../useSocket";
import useWindowDimensions from "../useWindowDimensions";

import wb from "../assets/pieces/wb.png";
import wk from "../assets/pieces/wk.png";
import wn from "../assets/pieces/wn.png";
import wp from "../assets/pieces/wp.png";
import wq from "../assets/pieces/wq.png";
import wr from "../assets/pieces/wr.png";

import bb from "../assets/pieces/bb.png";
import bk from "../assets/pieces/bk.png";
import bn from "../assets/pieces/bn.png";
import bp from "../assets/pieces/bp.png";
import bq from "../assets/pieces/bq.png";
import br from "../assets/pieces/br.png";

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

const Game = () => {
  const [fen, setFen] = useState<string | undefined>();
  const socket = useSocket("ws://localhost:3000");
  const board = new GameBoard(fen);

  const makeMove = (move: ListenerTypes.MakeMove) => {
    socket.emit(SOCKET_EVENTS.MAKE_MOVE, move);
  };

  useEffect(() => {
    socket.on(SOCKET_EVENTS.CONNECTED_TO_SERVER, () => {
      console.log("Connected to server", socket.id);
    });

    socket.on(SOCKET_EVENTS.SEND_MOVE, ({ fen }: ListenerTypes.SendMove) => {
      setFen(fen);
    });

    return () => {
      socket.offAny();
    };
  }, [socket]);

  return <Chessboard board={board} onMove={makeMove} />;
};

export default Game;

const Chessboard: React.FC<{
  board: GameBoard;
  blackPerspective?: boolean;
  size?: number;
  onMove: (move: ListenerTypes.MakeMove) => void; // TODO: onMove non optional callback function
}> = props => {
  const [selectedSquare, setSelectedSquare] = useState(EMPTY);
  const { windowHeight, windowWidth } = useWindowDimensions();

  const pieces = props.board.board
    .map((piece, idx) => ({ piece, square: idx }))
    .filter((_, idx) => isPositionValid(idx));
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
      selectSquare(
        e,
        selectedSquare,
        setSelectedSquare,
        props.board,
        props.onMove
      );
    },
    [selectedSquare, props.board.fen]
  );

  const moves = new Set<number>();

  if (selectedSquare != EMPTY) {
    const piece = props.board.getPiece(selectedSquare) as Piece;

    piece.getMoves(props.board).forEach(move => {
      const square = to0x88(move.square);

      moves.add(square);
    });
  }

  let square = 0;

  return (
    <div
      className="grid grid-cols-8 border-2 border-black w-fit"
      onPointerDown={onPointerDown}
      key={props.board.fen}
    >
      {pieces.map(({ piece, square }, idx) => (
        <Tile
          key={idx}
          isReversed={isReversed}
          size={tileSize}
          tilePosition={square}
          selected={(piece?.position ?? -2) == selectedSquare}
          pieceType={piece?.type}
          pieceColor={piece?.color}
          canMoveTo={moves.has(square)}
        />
      ))}
    </div>
  );
};

const Tile: React.FC<{
  isReversed: boolean;
  size: number;
  tilePosition: number;
  selected: boolean;
  canMoveTo: boolean;
  pieceType?: PieceType;
  pieceColor?: Color;
}> = props => {
  const rank = getRank(props.tilePosition);
  const file = getFile(props.tilePosition);

  const imgSrc = toImgSrc(props.pieceColor, props.pieceType);

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
      data-position={props.tilePosition}
      data-move={props.canMoveTo}
      data-has-piece={imgSrc != undefined}
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
  board: GameBoard,
  onMove: (move: ListenerTypes.MakeMove) => void
): void {
  const element = e.target as HTMLElement;
  const square = parseInt(element.dataset.position as string);

  if (selectedSquare != EMPTY) {
    setSelectedSquare(EMPTY);

    if (element.dataset.move == "false") return;

    return onMove({
      from: toAlgebraic(selectedSquare),
      to: toAlgebraic(square)
    });
  }

  if (element.dataset.hasPiece == "false") return setSelectedSquare(EMPTY);

  const piece = board.getPiece(square);

  if (piece == null) return setSelectedSquare(EMPTY);

  if (board.turn != piece.color) return setSelectedSquare(EMPTY);

  const moves = piece.getMoves(board);

  if (moves.length == 0) return setSelectedSquare(EMPTY);

  setSelectedSquare(square);
}
