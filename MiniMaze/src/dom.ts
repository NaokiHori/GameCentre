export function getCanvas(): HTMLCanvasElement {
  // get canvas element, whose id is "my-canvas"
  const id = `my-canvas`;
  const element: HTMLElement | null = document.getElementById(id);
  if (element === null) {
    throw new Error(`failed to get ${id}`);
  }
  return element as HTMLCanvasElement;
}

export function getContext(): CanvasRenderingContext2D {
  // check usability of canvas
  const canvas: HTMLCanvasElement = getCanvas();
  const context: CanvasRenderingContext2D | null = canvas.getContext(`2d`);
  if (!context) {
    throw new Error(`The browser does not support canvas element.`);
  }
  return context;
}
