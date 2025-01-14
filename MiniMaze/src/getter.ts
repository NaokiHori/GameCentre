// functions to get (mainly) HTML elements

export class Getter {

  static canvas(): HTMLCanvasElement {
    // get canvas element, whose id is "my-canvas"
    const id: string = `my-canvas`;
    const canvas: HTMLCanvasElement | null = <HTMLCanvasElement>document.getElementById(id);
    if (!canvas) {
      throw new Error(`failed to get ${id}`);
    }
    return canvas;
  }

  static canvas_container(): HTMLElement {
    // get size of the container (parent div element)
    const id: string = `canvas-container`;
    const container: HTMLElement | null = document.getElementById(id);
    if (!container) {
      throw new Error(`failed to get ${id}`);
    }
    return container;
  }

  static context(): CanvasRenderingContext2D {
    // check usability of canvas
    const canvas: HTMLCanvasElement = Getter.canvas();
    const context: CanvasRenderingContext2D | null = canvas.getContext(`2d`);
    if (!context) {
      throw new Error(`The browser does not support canvas element.`);
    }
    return context;
  }

}
