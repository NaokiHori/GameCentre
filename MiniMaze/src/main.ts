import { getCanvas, getContext } from "./dom";
import { maze_init, maze_move_cursor, maze_draw, Dir } from "./maze";

function getContainerSize(): [number, number] {
  const id = "canvas-container";
  const container: HTMLElement | null = document.getElementById(id);
  if (!container) {
    throw new Error(`failed to get ${id}`);
  }
  const w: number = container.clientWidth;
  const h: number = container.clientHeight;
  return [w, h];
}

function update_size(): void {
  // equalise the size of the containier and canvas
  const [w, h]: [number, number] = getContainerSize();
  const canvas: HTMLCanvasElement = getCanvas();
  canvas.width = w;
  canvas.height = h;
}

function update_canvas(): void {
  // update canvas
  const context: CanvasRenderingContext2D = getContext();
  const [w, h]: [number, number] = getContainerSize();
  // clean-up all
  context.clearRect(0, 0, w, h);
  // draw current state
  maze_draw(context, [w, h]);
}

window.addEventListener(`load`, () => {
  const url_params = new URLSearchParams(window.location.search);
  let size = 20;
  if (url_params.has(`size`)) {
    let tmp: number | null = Number(url_params.get(`size`));
    if (tmp) {
      tmp = tmp < 80 ? tmp : 80;
      tmp = 1 < tmp ? tmp : 1;
      tmp = Math.floor(tmp);
      size = tmp;
    }
  }
  maze_init([size, size]);
  update_size();
  update_canvas();
});

window.addEventListener(`resize`, () => {
  update_size();
  update_canvas();
});

window.addEventListener(`keydown`, (event: KeyboardEvent) => {
  switch (event.key) {
    case `ArrowUp`:
    case `k`:
    case `w`:
      maze_move_cursor(Dir.Bottom);
      break;
    case `ArrowDown`:
    case `j`:
    case `s`:
      maze_move_cursor(Dir.Top);
      break;
    case `ArrowLeft`:
    case `h`:
    case `a`:
      maze_move_cursor(Dir.Left);
      break;
    case `ArrowRight`:
    case `l`:
    case `d`:
      maze_move_cursor(Dir.Right);
      break;
    default:
      break;
  }
  update_canvas();
});
