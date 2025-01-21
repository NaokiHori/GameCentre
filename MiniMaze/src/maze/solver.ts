import { BoardSize, Cell, Position } from "./types";

interface WalkPattern {
  readonly canWalk: (position: Readonly<Position>) => boolean;
  readonly walk: (position: Readonly<Position>) => void;
}

export class Solver {
  private _isInvoked: boolean;

  public constructor() {
    this._isInvoked = false;
  }

  public solve(
    boardSize: Readonly<BoardSize>,
    board: ReadonlyArray<Array<Cell>>,
    start: Readonly<Position>,
    goal: Readonly<Position>,
  ): { isCompleted: boolean } {
    this._isInvoked = true;
    const position: Position | null = findStartingPoint(
      boardSize,
      board,
      start,
      goal,
    );
    if (null === position) {
      return { isCompleted: true };
    }
    board[position.y][position.x] = "DEADEND";
    const walkPatterns: ReadonlyArray<Readonly<WalkPattern>> =
      this.getWalkPatterns(boardSize, board, start, goal);
    randomWalk: for (;;) {
      for (const walkPattern of walkPatterns) {
        if (walkPattern.canWalk(position)) {
          walkPattern.walk(position);
          continue randomWalk;
        }
      }
      break randomWalk;
    }
    return { isCompleted: false };
  }

  public get isInvoked(): boolean {
    return this._isInvoked;
  }

  private getWalkPatterns(
    boardSize: Readonly<BoardSize>,
    board: ReadonlyArray<Array<Cell>>,
    start: Readonly<Position>,
    goal: Readonly<Position>,
  ): Array<WalkPattern> {
    return [
      {
        canWalk: (position: Position) => {
          const isAtLeftBound: boolean = 0 === position.x;
          const newPosition: Position = {
            x: position.x - 1,
            y: position.y,
          };
          return (
            !isAtLeftBound &&
            isDeadEnd(boardSize, board, start, goal, newPosition)
          );
        },
        walk: (position: Position) => {
          board[position.y][--position.x] = "DEADEND";
        },
      },
      {
        canWalk: (position: Position) => {
          const isAtRightBound: boolean = boardSize.width - 1 === position.x;
          const newPosition: Position = {
            x: position.x + 1,
            y: position.y,
          };
          return (
            !isAtRightBound &&
            isDeadEnd(boardSize, board, start, goal, newPosition)
          );
        },
        walk: (position: Position) => {
          board[position.y][++position.x] = "DEADEND";
        },
      },
      {
        canWalk: (position: Position) => {
          const isAtBottomBound: boolean = 0 === position.y;
          const newPosition: Position = {
            x: position.x,
            y: position.y - 1,
          };
          return (
            !isAtBottomBound &&
            isDeadEnd(boardSize, board, start, goal, newPosition)
          );
        },
        walk: (position: Position) => {
          board[--position.y][position.x] = "DEADEND";
        },
      },
      {
        canWalk: (position: Position) => {
          const isAtTopBound: boolean = boardSize.height - 1 === position.y;
          const newPosition: Position = {
            x: position.x,
            y: position.y + 1,
          };
          return (
            !isAtTopBound &&
            isDeadEnd(boardSize, board, start, goal, newPosition)
          );
        },
        walk: (position: Position) => {
          board[++position.y][position.x] = "DEADEND";
        },
      },
    ];
  }
}

function findStartingPoint(
  boardSize: Readonly<BoardSize>,
  board: ReadonlyArray<ReadonlyArray<Cell>>,
  start: Readonly<Position>,
  goal: Readonly<Position>,
): Position | null {
  for (let row = 0; row < boardSize.height; row++) {
    for (let column = 0; column < boardSize.width; column++) {
      const position: Readonly<Position> = { x: column, y: row };
      if (isDeadEnd(boardSize, board, start, goal, position)) {
        return position;
      }
    }
  }
  return null;
}

function isDeadEnd(
  boardSize: Readonly<BoardSize>,
  board: ReadonlyArray<ReadonlyArray<Cell>>,
  start: Readonly<Position>,
  goal: Readonly<Position>,
  position: Readonly<Position>,
): boolean {
  // start / goal are exceptions
  if (start.x === position.x && start.y === position.y) {
    return false;
  }
  if (goal.x === position.x && goal.y === position.y) {
    return false;
  }
  // dead-end should be a part of roads
  if ("ROAD" !== board[position.y][position.x]) {
    return false;
  }
  // find cells which are closed: either WALL or DEADEND
  const isAtLeftBound: boolean = 0 === position.x;
  const isAtRightBound: boolean = boardSize.width - 1 === position.x;
  const isAtBottomBound: boolean = 0 === position.y;
  const isAtTopBound: boolean = boardSize.height - 1 === position.y;
  const criteria: ReadonlyArray<boolean> = [
    isAtLeftBound || isClosed(board[position.y][position.x - 1]),
    isAtRightBound || isClosed(board[position.y][position.x + 1]),
    isAtBottomBound || isClosed(board[position.y - 1][position.x]),
    isAtTopBound || isClosed(board[position.y + 1][position.x]),
  ];
  // dead-end is defined to be a cell whose three edges are closed
  return 3 === criteria.filter(Boolean).length;
}

function isClosed(cell: Readonly<Cell>): boolean {
  return "WALL" === cell || "DEADEND" === cell;
}
