import { getElementByIdUnwrap } from "./dom";
import { Equations } from "./equation";
import { rgbToHsv } from "./convert";

interface Coordinate {
  x: number;
  y: number;
}

export class Graph {
  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;
  private _titles: { rgb: HTMLDivElement; hsv: HTMLDivElement };
  private _displayHsv: boolean;

  public constructor({ elementId }: { elementId: string }) {
    const canvas = getElementByIdUnwrap(elementId) as HTMLCanvasElement;
    const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
    if (null === ctx) {
      throw new Error("Failed to get context");
    }
    const rect: DOMRect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const titles = {
      rgb: getElementByIdUnwrap("graph-title-rgb") as HTMLDivElement,
      hsv: getElementByIdUnwrap("graph-title-hsv") as HTMLDivElement,
    };
    this._canvas = canvas;
    this._ctx = ctx;
    this._titles = titles;
    this._displayHsv = false;
  }

  public draw(equations: Equations) {
    const canvas: HTMLCanvasElement = this._canvas;
    const ctx: CanvasRenderingContext2D = this._ctx;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const marginX: [number, number] = [canvasWidth * 0.1, canvasWidth * 0.025];
    const marginY: [number, number] = [canvasHeight * 0.1, canvasHeight * 0.05];
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawLine(ctx, canvasWidth, canvasHeight, 10, "#000000", marginX, marginY, [
      { x: 1, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
    ]);
    const resolution = 1024;
    const lineWidth = 5;
    const points = [
      new Array<Coordinate>(resolution),
      new Array<Coordinate>(resolution),
      new Array<Coordinate>(resolution),
    ];
    for (let i = 0; i < resolution; i++) {
      const x = (i + 1) / (resolution + 1);
      const r = equations.red(x);
      const g = equations.green(x);
      const b = equations.blue(x);
      if (this._displayHsv) {
        const [h, s, v] = rgbToHsv([r, g, b]);
        points[0][i] = {
          x,
          y: h,
        };
        points[1][i] = {
          x,
          y: s,
        };
        points[2][i] = {
          x,
          y: v,
        };
      } else {
        points[0][i] = {
          x,
          y: r,
        };
        points[1][i] = {
          x,
          y: g,
        };
        points[2][i] = {
          x,
          y: b,
        };
      }
    }
    const lineColors = [
      this._displayHsv ? "#00FFFF" : "#FF0000",
      this._displayHsv ? "#FF00FF" : "#00FF00",
      this._displayHsv ? "#FFFF00" : "#0000FF",
    ];
    for (let j = 0; j < 3; j++) {
      drawLine(
        ctx,
        canvasWidth,
        canvasHeight,
        lineWidth,
        lineColors[j],
        marginX,
        marginY,
        points[j],
      );
    }
  }

  public setClickHandler(onClick: () => void) {
    this._canvas.addEventListener("click", () => {
      this._displayHsv = !this._displayHsv;
      this._titles.rgb.setAttribute(
        "style",
        `display: ${this._displayHsv ? "none" : "inline"};`,
      );
      this._titles.hsv.setAttribute(
        "style",
        `display: ${this._displayHsv ? "inline" : "none"};`,
      );
      onClick();
    });
  }
}

function drawLine(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  lineWidth: number,
  lineColor: string,
  marginX: [number, number],
  marginY: [number, number],
  points: Array<Coordinate>,
) {
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = lineColor;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(
    convertX(canvasWidth, marginX, points[0].x),
    convertY(canvasHeight, marginY, points[0].y),
  );
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(
      convertX(canvasWidth, marginX, points[i].x),
      convertY(canvasHeight, marginY, points[i].y),
    );
  }
  ctx.stroke();
}

function convertX(
  canvasWidth: number,
  margin: [number, number],
  x: number,
): number {
  return margin[0] + (canvasWidth - margin[0] - margin[1]) * x;
}

function convertY(
  canvasHeight: number,
  margin: [number, number],
  y: number,
): number {
  return canvasHeight - margin[0] - (canvasHeight - margin[0] - margin[1]) * y;
}
