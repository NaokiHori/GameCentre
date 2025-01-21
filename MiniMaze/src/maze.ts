import { Cell, Direction, BoardSize, Position } from "./maze/types";
import { Maker } from "./maze/maker";
import { Player } from "./maze/player";
import { Solver } from "./maze/solver";
import { Drawer } from "./maze/drawer";

export class Maze {
  private _boardSize: Readonly<BoardSize>;
  private _maker: Maker;
  private _player: Player;
  private _solver: Solver;
  private _drawer: Drawer;
  private _start: Readonly<Position>;
  private _goal: Readonly<Position>;

  public constructor(size: { width: number; height: number }) {
    const boardSize: BoardSize = decideBoardSize(size);
    const maker = new Maker(boardSize);
    const player = new Player();
    const solver = new Solver();
    const drawer = new Drawer();
    this._boardSize = boardSize;
    this._maker = maker;
    this._player = player;
    this._solver = solver;
    this._drawer = drawer;
    this._start = { x: 0, y: 0 };
    this._goal = { x: boardSize.width - 1, y: boardSize.height - 1 };
  }

  public make(): { isCompleted: boolean } {
    return this._maker.updateBoard();
  }

  public solve(): { isCompleted: boolean } {
    return this._solver.solve(
      this._boardSize,
      this._maker.board,
      this._start,
      this._goal,
    );
  }

  public moveCursor(direction: Direction) {
    if (!this.completeMaking()) {
      console.log("Cannot play it until the making process has been completed");
      return;
    }
    if (this._solver.isInvoked) {
      console.log("Solver has been invoked; cursor movements are not allowed");
      return;
    }
    const boardSize: Readonly<BoardSize> = this._boardSize;
    const board: ReadonlyArray<ReadonlyArray<Cell>> = this._maker.board;
    this._player.moveCursor(direction, boardSize, board);
  }

  public draw(ctx: CanvasRenderingContext2D, screenSize: [number, number]) {
    const completeMaking: boolean = this.completeMaking();
    const isSolverInvoked: boolean = this._solver.isInvoked;
    const boardSize: BoardSize = this._boardSize;
    const board: ReadonlyArray<ReadonlyArray<Cell>> = this._maker.board;
    const cursor: Position = this._player.cursor;
    const trajectory: ReadonlyArray<Position> = this._player.trajectory;
    this._drawer.draw(
      ctx,
      screenSize,
      completeMaking,
      isSolverInvoked,
      boardSize,
      board,
      cursor,
      trajectory,
      this._start,
      this._goal,
    );
  }

  private completeMaking(): boolean {
    return this._maker.isCompleted;
  }
}

function decideBoardSize(size: { width: number; height: number }): BoardSize {
  const width: number = Math.max(1, Math.floor(size.width));
  const height: number = Math.max(1, Math.floor(size.height));
  return {
    width: 2 * width + 1,
    height: 2 * height + 1,
  };
}
