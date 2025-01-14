import { Getter } from "./getter.js";
import { Maze, Dir as MazeDir } from "./maze.js";

function get_container_size(): [number, number] {
  const container: HTMLElement = Getter.canvas_container();
  const w: number = container.clientWidth;
  const h: number = container.clientHeight;
  return [w, h]
}

function update_size(): void {
  // equalise the size of the containier and canvas
  const [w, h]: [number, number] = get_container_size();
  const canvas: HTMLCanvasElement = Getter.canvas();
  canvas.width  = w;
  canvas.height = h;
}

function update_canvas(): void {
  // update canvas
  const context: CanvasRenderingContext2D = Getter.context();
  const [w, h]: [number, number] = get_container_size();
  // clean-up all
  context.clearRect(0, 0, w, h);
  // draw current state
  Maze.draw(context, [w, h]);
}

window.addEventListener(`load`, (_event: Event) => {
  const url_params = new URLSearchParams(window.location.search);
  let size: number = 20;
  if (url_params.has(`size`)) {
    let tmp: number | null = Number(url_params.get(`size`));
    if (tmp) {
      tmp = tmp < 80 ? tmp : 80;
      tmp = 1 < tmp ? tmp : 1;
      tmp = Math.floor(tmp);
      size = tmp;
    }
  }
  Maze.init([size, size]);
  update_size();
  update_canvas();
});

window.addEventListener(`resize`, (_event: Event) => {
  update_size();
  update_canvas();
});

window.addEventListener(`keydown`, (event: KeyboardEvent) => {
  switch (event.key) {
    case `ArrowUp`:
    case `k`:
    case `w`:
      Maze.move_cursor(MazeDir.Bottom);
      break;
    case `ArrowDown`:
    case `j`:
    case `s`:
      Maze.move_cursor(MazeDir.Top);
      break;
    case `ArrowLeft`:
    case `h`:
    case `a`:
      Maze.move_cursor(MazeDir.Left);
      break;
    case `ArrowRight`:
    case `l`:
    case `d`:
      Maze.move_cursor(MazeDir.Right);
      break;
    default:
      break;
  }
  update_canvas();
});

