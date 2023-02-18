import { useCallback, useState } from "react";
import Show from "./components/Show";
import useWindowDimensions from "./hooks/useWindowDimensions";
import { DEFAULT_POSITION } from "./model/utils";

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

const SQUARE_COLORS = {
  light: "#ECECD7",
  dark: "#4D6D92"
};

const MIN_SIZE = 480;
const MAX_SIZE = 720;

// prettier-ignore
const PIECE_IMAGES:Record<string,string> = {
  p: bp, n: bn, b: bb, r: br, q: bq, k: bk,
  P: wp, N: wn, B: wb, R: wr, Q: wq, K: wk
};

const Chessboard: React.FC<{
  fen?: string; // TODO: fen validation
  blackPerspective?: boolean;
  size?: number;
  onMove?: unknown; // TODO: onMove non optional callback function
}> = props => {
  const [selectedSquare, setSelectedSquare] = useState(-1);
  const { windowHeight, windowWidth } = useWindowDimensions();

  const fen = props.fen ?? DEFAULT_POSITION;

  const position = fen
    .split(" ")[0]
    .split("/")
    .map(row => {
      const arr: string[] = [];

      [...row].forEach(chr => {
        if (/^\d$/.test(chr) == false) arr.push(chr);
        else arr.push(...Array.from({ length: parseInt(chr) }, _ => ""));
      });

      return arr;
    });

  const isReversed = props.blackPerspective ?? false;

  if (isReversed) position.reverse();

  const tileSize =
    constrain(
      props.size ?? MAX_SIZE,
      MIN_SIZE,
      Math.min(MAX_SIZE, windowHeight, windowWidth)
    ) / 8;

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      selectSquare(e, selectedSquare, setSelectedSquare);
    },

    [selectedSquare]
  );

  return (
    <div
      className="grid grid-cols-8 border-2 border-black w-fit m-1"
      onPointerDown={onPointerDown}
      key={fen}
    >
      {position.map((row, y) =>
        row.map((symbol, x) => {
          return (
            <Tile
              size={tileSize}
              key={y * 8 + x}
              isReversed={isReversed}
              pieceSymbol={symbol}
              tileRow={y}
              tileColumn={x}
            />
          );
        })
      )}
    </div>
  );
};

export default Chessboard;

const Tile: React.FC<{
  pieceSymbol: string;
  isReversed: boolean;
  tileRow: number;
  tileColumn: number;
  size: number;
}> = props => {
  const img = PIECE_IMAGES[props.pieceSymbol];

  return (
    <div
      className="aspect-square flex items-center justify-center bg-transparent relative"
      style={{
        backgroundColor:
          isEven(props.tileColumn + props.tileRow) == props.isReversed
            ? SQUARE_COLORS.dark
            : SQUARE_COLORS.light,
        width: `${props.size}px`
      }}
      data-piece={props.pieceSymbol}
      data-number={props.tileColumn * 8 + props.tileRow}
    >
      <Show when={img != undefined}>
        <img src={img} className="pointer-events-none w-[95%]" />
      </Show>
      <Show when={props.tileColumn == 0}>
        <span
          className="absolute top-0.5 left-0.5 font-bold pointer-events-none"
          style={{
            color:
              isEven(props.tileColumn + props.tileRow) == props.isReversed
                ? SQUARE_COLORS.light
                : SQUARE_COLORS.dark,
            fontSize: `${props.size * 0.2}px`
          }}
        >
          {props.isReversed ? props.tileRow + 1 : 8 - props.tileRow}
        </span>
      </Show>
      <Show when={props.tileRow == 7}>
        <span
          className="absolute bottom-0.5 right-1 font-bold pointer-events-none"
          style={{
            color:
              isEven(props.tileColumn + props.tileRow) == props.isReversed
                ? SQUARE_COLORS.light
                : SQUARE_COLORS.dark,
            fontSize: `${props.size * 0.2}px`
          }}
        >
          {"abcdefgh".substring(props.tileColumn, props.tileColumn + 1)}
        </span>
      </Show>
    </div>
  );
};

function constrain(value: number, min: number, max: number) {
  return value > max ? max : value < min ? min : value;
}

function isEven(x: number) {
  return x % 2 == 0;
}

function selectSquare(
  e: React.PointerEvent,
  selectedSquare: number,
  setSelectedSquare: React.Dispatch<React.SetStateAction<number>>
) {
  const square = e.target as HTMLElement;

  console.log(square.dataset.piece, square.dataset.number);
}
