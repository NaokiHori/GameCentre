import { Equations } from "./equation";

export class ColorMap {
  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;

  public constructor({ elementId }: { elementId: string }) {
    const element: HTMLElement | null = document.getElementById(elementId);
    if (null === element) {
      throw new Error(`Canvas element ${elementId} not found`);
    }
    const canvas = element as HTMLCanvasElement;
    const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
    if (null === ctx) {
      throw new Error("Failed to get context");
    }
    this._canvas = canvas;
    this._ctx = ctx;
  }

  public draw(equations: Equations) {
    const canvas: HTMLCanvasElement = this._canvas;
    const ctx: CanvasRenderingContext2D = this._ctx;
    const width = canvas.width;
    const height = canvas.height;
    const offscreenCanvas = renderOffScreen(width, equations);
    ctx.drawImage(offscreenCanvas, 0, 0, width, height);
  }
}

function renderOffScreen(
  width: number,
  equations: {
    red: (value: number) => number;
    green: (value: number) => number;
    blue: (value: number) => number;
  },
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = 1;
  const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
  if (ctx === null) {
    throw new Error("Failed to get off-screen canvas context");
  }
  const imageData = ctx.createImageData(width, 1);
  const data = imageData.data;
  for (let i = 0; i < width; i++) {
    const value = i / (width - 1);
    const r = equations.red(value);
    const g = equations.green(value);
    const b = equations.blue(value);
    data[4 * i + 0] = Math.trunc(255 * r);
    data[4 * i + 1] = Math.trunc(255 * g);
    data[4 * i + 2] = Math.trunc(255 * b);
    data[4 * i + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}
