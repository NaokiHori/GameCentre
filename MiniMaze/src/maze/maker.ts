import { Cell, BoardSize, Position, Direction } from "./types";

export class Maker {
  private _boardSize: BoardSize;
  private _board: Array<Array<Cell>>;
  private _isCompleted: boolean;

  public constructor(boardSize: BoardSize) {
    const board: Array<Array<Cell>> = Array.from(
      { length: boardSize.height },
      () => new Array<Cell>(boardSize.width).fill("WALL"),
    );
    board[0][0] = "ROAD";
    this._boardSize = { ...boardSize };
    this._board = board;
    this._isCompleted = false;
  }

  public updateBoard(): { isCompleted: boolean } {
    const boardSize: BoardSize = this._boardSize;
    const board: ReadonlyArray<Array<Cell>> = this._board;
    const isCompleted: boolean = depthFirstSearch(boardSize, board);
    this._isCompleted = isCompleted;
    return { isCompleted };
  }

  public get board(): ReadonlyArray<ReadonlyArray<Cell>> {
    return this._board;
  }

  public get isCompleted(): boolean {
    return this._isCompleted;
  }
}

function depthFirstSearch(
  boardSize: BoardSize,
  board: ReadonlyArray<Array<Cell>>,
): boolean {
  const currentPosition: Position | null = findStartingPoint(boardSize, board);
  if (null === currentPosition) {
    return true;
  }
  randomWalk: for (;;) {
    const directions: Array<Direction> = shuffle<Direction>([
      "LEFT",
      "RIGHT",
      "DOWN",
      "UP",
    ]);
    for (const direction of directions) {
      if (isDirectionWall(boardSize, board, direction, currentPosition)) {
        switch (direction) {
          case "DOWN":
            board[--currentPosition.y][currentPosition.x] = "ROAD";
            board[--currentPosition.y][currentPosition.x] = "ROAD";
            break;
          case "UP":
            board[++currentPosition.y][currentPosition.x] = "ROAD";
            board[++currentPosition.y][currentPosition.x] = "ROAD";
            break;
          case "LEFT":
            board[currentPosition.y][--currentPosition.x] = "ROAD";
            board[currentPosition.y][--currentPosition.x] = "ROAD";
            break;
          case "RIGHT":
            board[currentPosition.y][++currentPosition.x] = "ROAD";
            board[currentPosition.y][++currentPosition.x] = "ROAD";
            break;
          default:
            throw new Error("should not reach here");
        }
        continue randomWalk;
      }
    }
    break randomWalk;
  }
  return false;
}

function shuffle<T>(vec: Array<T>) {
  const nitems: number = vec.length;
  for (let i = 0; i < nitems; i++) {
    const j: number = Math.floor(Math.random() * (i + 1));
    [vec[i], vec[j]] = [vec[j], vec[i]];
  }
  return vec;
}

function findStartingPoint(
  boardSize: BoardSize,
  board: ReadonlyArray<ReadonlyArray<Cell>>,
): Position | null {
  for (let j = 0; j < boardSize.height; j += 2) {
    for (let i = 0; i < boardSize.width; i += 2) {
      const cell: Cell = board[j][i];
      if ("WALL" === cell) {
        continue;
      }
      const lookFrom: Position = { x: i, y: j };
      if (
        isDirectionWall(boardSize, board, "DOWN", lookFrom) ||
        isDirectionWall(boardSize, board, "UP", lookFrom) ||
        isDirectionWall(boardSize, board, "LEFT", lookFrom) ||
        isDirectionWall(boardSize, board, "RIGHT", lookFrom)
      ) {
        return lookFrom;
      }
    }
  }
  return null;
}

function isDirectionWall(
  boardSize: BoardSize,
  board: ReadonlyArray<ReadonlyArray<Cell>>,
  direction: Direction,
  lookFrom: Position,
): boolean {
  switch (direction) {
    case "DOWN":
      if (0 === lookFrom.y) return false;
      if ("ROAD" === board[lookFrom.y - 2][lookFrom.x]) return false;
      return true;
    case "UP":
      if (boardSize.height - 1 === lookFrom.y) return false;
      if ("ROAD" === board[lookFrom.y + 2][lookFrom.x]) return false;
      return true;
    case "LEFT":
      if (0 === lookFrom.x) return false;
      if ("ROAD" === board[lookFrom.y][lookFrom.x - 2]) return false;
      return true;
    case "RIGHT":
      if (boardSize.width - 1 === lookFrom.x) return false;
      if ("ROAD" === board[lookFrom.y][lookFrom.x + 2]) return false;
      return true;
    default:
      throw new Error("should not reach here");
  }
}
