import { Cell, Direction, BoardSize, Position } from "./types";

export class Player {
  private _cursor: Position;
  private _trajectory: Array<Position>;

  public constructor() {
    const cursor: Position = { x: 0, y: 0 };
    const trajectory: Array<Position> = [{ ...cursor }];
    this._cursor = cursor;
    this._trajectory = trajectory;
  }

  public moveCursor(
    direction: Direction,
    boardSize: BoardSize,
    board: ReadonlyArray<ReadonlyArray<Cell>>,
  ) {
    const cursor: Position = this._cursor;
    const trajectory: Array<Position> = this._trajectory;
    switch (direction) {
      case "DOWN":
        if (0 === cursor.y) return;
        if ("WALL" === board[cursor.y - 1][cursor.x]) return;
        cursor.y -= 1;
        break;
      case "UP":
        if (boardSize.height - 1 === cursor.y) return;
        if ("WALL" === board[cursor.y + 1][cursor.x]) return;
        cursor.y += 1;
        break;
      case "LEFT":
        if (0 === cursor.x) return;
        if ("WALL" === board[cursor.y][cursor.x - 1]) return;
        cursor.x -= 1;
        break;
      case "RIGHT":
        if (boardSize.width - 1 === cursor.x) return;
        if ("WALL" === board[cursor.y][cursor.x + 1]) return;
        cursor.x += 1;
        break;
      default:
        throw new Error("should not reach here");
    }
    updateTrajectory(cursor, trajectory);
    if (isAtGoal(boardSize, cursor)) {
      console.log("Done");
    }
  }

  public get cursor(): Position {
    return this._cursor;
  }

  public get trajectory(): ReadonlyArray<Position> {
    return this._trajectory;
  }
}

function updateTrajectory(cursor: Position, trajectory: Array<Position>) {
  const nitems: number = trajectory.length;
  if (1 < nitems) {
    const last: Position = trajectory[nitems - 2];
    if (last.x === cursor.x && last.y === cursor.y) {
      trajectory.pop();
      return;
    }
  }
  trajectory.push({ x: cursor.x, y: cursor.y });
}

function isAtGoal(boardSize: BoardSize, position: Position): boolean {
  if (boardSize.width - 1 !== position.x) {
    return false;
  }
  if (boardSize.height - 1 !== position.y) {
    return false;
  }
  return true;
}
