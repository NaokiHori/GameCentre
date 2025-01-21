import { Position, Cell, BoardSize } from "./types";

export class Drawer {
  private _offScreenCanvas: HTMLCanvasElement;

  public constructor() {
    const canvas = document.createElement("canvas");
    const size: BoardSize = {
      width: 256,
      height: 256,
    };
    canvas.width = size.width;
    canvas.height = size.height;
    const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
    if (ctx === null) {
      throw new Error("The browser does not support canvas element");
    }
    const imageData = ctx.getImageData(0, 0, size.width, size.height);
    const data = imageData.data;
    for (let row = 0; row < size.height; row++) {
      const y = row - 0.5 * size.height;
      for (let column = 0; column < size.width; column++) {
        const x = column - 0.5 * size.width;
        const [r, g, b] = getColor(size, { x, y });
        data["RGBA".length * (row * size.width + column) + 0] = r;
        data["RGBA".length * (row * size.width + column) + 1] = g;
        data["RGBA".length * (row * size.width + column) + 2] = b;
        data["RGBA".length * (row * size.width + column) + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
    this._offScreenCanvas = canvas;
  }

  public draw(
    ctx: CanvasRenderingContext2D,
    screenSize: [number, number],
    completeMaking: boolean,
    isSolverInvoked: boolean,
    boardSize: BoardSize,
    board: ReadonlyArray<ReadonlyArray<Cell>>,
    cursor: Position,
    trajectory: ReadonlyArray<Position>,
    start: Position,
    goal: Position,
  ) {
    const N_HALO = 1;
    const boardWidth: number = boardSize.width;
    const boardHeight: number = boardSize.height;
    const dx: number = screenSize[0] / (boardWidth + 2 * N_HALO);
    const dy: number = screenSize[1] / (boardHeight + 2 * N_HALO);
    ctx.drawImage(this._offScreenCanvas, 0, 0, screenSize[0], screenSize[1]);
    const drawRect = (row: number, column: number) => {
      const disps = [0.02 * dx, 0.02 * dy];
      ctx.fillRect(
        (column + N_HALO) * dx - disps[0],
        (row + N_HALO) * dy - disps[1],
        dx + 2 * disps[0],
        dy + 2 * disps[1],
      );
    };
    // wall
    {
      ctx.fillStyle = "#000000";
      for (let row = 0; row < boardHeight; row++) {
        for (let column = 0; column < boardWidth; column++) {
          if ("WALL" === board[row][column]) {
            drawRect(row, column);
          }
        }
      }
      for (let row = -1; row < boardHeight + 1; row++) {
        drawRect(row, -1);
        drawRect(row, boardWidth);
      }
      for (let column = 0; column < boardWidth; column++) {
        drawRect(-1, column);
        drawRect(boardHeight, column);
      }
    }
    // dead-end
    {
      ctx.fillStyle = "#444444";
      for (let row = 0; row < boardHeight; row++) {
        for (let column = 0; column < boardWidth; column++) {
          if ("DEADEND" === board[row][column]) {
            drawRect(row, column);
          }
        }
      }
    }
    // trajectory
    if (completeMaking && !isSolverInvoked) {
      ctx.fillStyle = "#ffffff";
      for (const point of trajectory) {
        drawRect(point.y, point.x);
      }
    }
    // cursor
    if (completeMaking && !isSolverInvoked) {
      ctx.fillStyle = "#ffffff";
      drawRect(cursor.y, cursor.x);
    }
    // start and goal
    if (completeMaking) {
      ctx.fillStyle = "#ffffff";
      drawRect(start.y, start.x);
      drawRect(goal.y, goal.x);
    }
  }
}

function getColor(
  boardSize: BoardSize,
  radiusVector: Position,
): [number, number, number] {
  const angleInRadian = Math.atan2(radiusVector.y, radiusVector.x);
  const angleInDegree = Math.floor((180 / Math.PI) * (Math.PI + angleInRadian));
  const magnitude = norm(radiusVector);
  const maxMagnitude = norm({
    x: 0.5 * boardSize.width,
    y: 0.5 * boardSize.height,
  });
  const hue = angleInDegree;
  const saturation = 25 + 75 * (magnitude / maxMagnitude);
  const lightness = 75 - 25 * (magnitude / maxMagnitude);
  const min =
    lightness < 50
      ? 2.55 * (lightness - lightness * (saturation / 100))
      : 2.55 * (lightness - (100 - lightness) * (saturation / 100));
  const max =
    lightness < 50
      ? 2.55 * (lightness + lightness * (saturation / 100))
      : 2.55 * (lightness + (100 - lightness) * (saturation / 100));
  if (hue < 60) {
    return [max, (hue / 60) * (max - min) + min, min];
  } else if (hue < 120) {
    return [((120 - hue) / 60) * (max - min) + min, max, min];
  } else if (hue < 180) {
    return [min, max, ((hue - 120) / 60) * (max - min) + min];
  } else if (hue < 240) {
    return [min, ((240 - hue) / 60) * (max - min) + min, max];
  } else if (hue < 300) {
    return [((hue - 240) / 60) * (max - min) + min, min, max];
  } else {
    return [max, min, ((360 - hue) / 60) * (max - min) + min];
  }
}

function norm(position: Position): number {
  return Math.sqrt(Math.pow(position.x, 2) + Math.pow(position.y, 2));
}
