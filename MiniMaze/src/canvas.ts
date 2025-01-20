export class Canvas {
  private _element: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;

  public constructor() {
    const canvas: HTMLCanvasElement = getCanvas();
    const ctx: CanvasRenderingContext2D = getContext(canvas);
    this._element = canvas;
    this._ctx = ctx;
    this.syncSize();
  }

  private syncSize() {
    const element: HTMLCanvasElement = this._element;
    const rect: DOMRect = element.getBoundingClientRect();
    element.width = rect.width;
    element.height = rect.height;
  }

  public get width(): number {
    return this._element.width;
  }

  public get height(): number {
    return this._element.height;
  }

  public get ctx(): CanvasRenderingContext2D {
    return this._ctx;
  }
}

function getCanvas(): HTMLCanvasElement {
  const id = "canvas";
  const element: HTMLElement | null = document.getElementById(id);
  if (element === null) {
    throw new Error(`Failed to get ${id}`);
  }
  return element as HTMLCanvasElement;
}

function getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
  if (ctx === null) {
    throw new Error("The browser does not support canvas element");
  }
  return ctx;
}
