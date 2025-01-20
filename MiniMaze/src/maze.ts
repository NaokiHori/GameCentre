import { Cell, Direction, BoardSize, Position } from "./maze/types";
import { Maker } from "./maze/maker";
import { Player } from "./maze/player";

export class Maze {
  private _boardSize: BoardSize;
  private _maker: Maker;
  private _player: Player;

  public constructor(size: { width: number; height: number }) {
    const boardSize: BoardSize = decideBoardSize(size);
    const maker = new Maker(boardSize);
    const player = new Player();
    this._boardSize = boardSize;
    this._maker = maker;
    this._player = player;
  }

  public proceedMakingProcess() {
    this._maker.updateBoard();
  }

  public isMakingCompleted(): boolean {
    return this._maker.isCompleted;
  }

  public moveCursor(direction: Direction) {
    if (!this.isMakingCompleted()) {
      console.log("Cannot play it until the making process has been completed");
      return;
    }
    const boardSize: BoardSize = this._boardSize;
    const board: ReadonlyArray<ReadonlyArray<Cell>> = this._maker.board;
    this._player.moveCursor(direction, boardSize, board);
  }

  public draw(ctx: CanvasRenderingContext2D, screenSize: [number, number]) {
    const N_HALO = 1;
    const board: ReadonlyArray<ReadonlyArray<Cell>> = this._maker.board;
    const cursor: Position = this._player.cursor;
    const trajectory: ReadonlyArray<Position> = this._player.trajectory;
    const boardWidth: number = this._boardSize.width;
    const boardHeight: number = this._boardSize.height;
    const dx: number = screenSize[0] / (boardWidth + 2 * N_HALO);
    const dy: number = screenSize[1] / (boardHeight + 2 * N_HALO);
    // maze
    for (let j = 0; j < boardHeight; j++) {
      for (let i = 0; i < boardWidth; i++) {
        if ("ROAD" === board[j][i]) {
          ctx.fillStyle = getColor({ x: i, y: j }, this._boardSize);
          ctx.fillRect((i + N_HALO) * dx, (j + N_HALO) * dy, dx, dy);
        }
      }
    }
    // trajectory
    if (this.isMakingCompleted()) {
      ctx.fillStyle = "#ffffff";
      for (const point of trajectory) {
        ctx.fillRect((point.x + N_HALO) * dx, (point.y + N_HALO) * dy, dx, dy);
      }
    }
    // cursor
    if (this.isMakingCompleted()) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect((cursor.x + N_HALO) * dx, (cursor.y + N_HALO) * dy, dx, dy);
    }
    // start and goal
    if (this.isMakingCompleted()) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect((0 + N_HALO) * dx, (0 + N_HALO) * dy, dx, dy);
      ctx.fillRect(
        (boardWidth - 1 + N_HALO) * dx,
        (boardHeight - 1 + N_HALO) * dy,
        dx,
        dy,
      );
    }
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

function getColor(position: Position, boardSize: BoardSize): string {
  const radiusVector: Position = {
    x: position.x + 0.5 - 0.5 * boardSize.width,
    y: position.y + 0.5 - 0.5 * boardSize.height,
  };
  const angleInRadian = Math.atan2(radiusVector.y, radiusVector.x);
  const angleInDegree = Math.floor((180 / Math.PI) * (Math.PI + angleInRadian));
  const magnitude = Math.sqrt(
    Math.pow(radiusVector.x, 2) + Math.pow(radiusVector.y, 2),
  );
  const maxMagnitude = Math.sqrt(
    Math.pow(0.5 * boardSize.width, 2) + Math.pow(0.5 * boardSize.height, 2),
  );
  const hue = angleInDegree;
  const saturation = 25 + 75 * (magnitude / maxMagnitude);
  const lightness = 75 - 50 * (magnitude / maxMagnitude);
  return `hsl(${hue.toString()}deg ${saturation.toString()}% ${lightness.toString()}%)`;
}
