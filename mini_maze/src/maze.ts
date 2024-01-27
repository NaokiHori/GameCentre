let g_board: Cell[][];
let g_cursor: [number, number];
let g_path_pts: [number, number][];
let g_done: boolean = false;

enum Cell {
  Wall = 0,
  Road = 1,
}

export enum Dir {
  Bottom = 0,
  Top    = 1,
  Left   = 2,
  Right  = 3,
}

function shuffle<T>(vec: T[]) {
  const nitems: number = vec.length;
  for (let i: number = nitems - 1; i > 0; i--) {
    const j: number = Math.floor(Math.random() * (i + 1));
    [vec[i], vec[j]] = [vec[j], vec[i]];
  }
  return vec;
}

function can_move_to(board: Cell[][], dir: number, at: [number, number]): boolean {
  const h: number = board.length;
  const w: number = board[0].length;
  const i: number = at[0];
  const j: number = at[1];
  switch (dir) {
    case Dir.Bottom:
      if (0 === j) return false;
      if (Cell.Road === board[j-2][i  ]) return false;
      break;
    case Dir.Top:
      if (h - 1 === j) return false;
      if (Cell.Road === board[j+2][i  ]) return false;
      break;
    case Dir.Left:
      if (0 === i) return false;
      if (Cell.Road === board[j  ][i-2]) return false;
      break;
    case Dir.Right:
      if (w - 1 === i) return false;
      if (Cell.Road === board[j  ][i+2]) return false;
      break;
    default:
      throw new Error(`should not reach here`);
  }
  return true;
}

function find_next(board: Cell[][]): [number, number] | null {
  const h: number = board.length;
  const w: number = board[0].length;
  for (let j: number = 0; j < h; j += 2) {
    for (let i: number = 0; i < w; i += 2) {
      const cell: Cell = board[j][i];
      if (Cell.Wall === cell) {
        continue;
      }
      const at: [number, number] = [i, j];
      if (
           can_move_to(board, Dir.Bottom, at)
        || can_move_to(board, Dir.Top,    at)
        || can_move_to(board, Dir.Left,   at)
        || can_move_to(board, Dir.Right,  at)
      ) {
        return at;
      }
    }
  }
  return null;
}

function init_board(board: Cell[][]): boolean {
  const next: [number, number] | null = find_next(board);
  if (!next) {
    return false;
  }
  let i: number = next[0];
  let j: number = next[1];
  random_walk: while (true) {
    const dirs: Dir[] = shuffle<Dir>([
      Dir.Left,
      Dir.Right,
      Dir.Bottom,
      Dir.Top,
    ]);
    for (const dir of dirs) {
      if (can_move_to(board, dir, [i, j])) {
        switch (dir) {
          case Dir.Bottom:
            board[j-1][i  ] = Cell.Road;
            board[j-2][i  ] = Cell.Road;
            j -= 2;
            break;
          case Dir.Top:
            board[j+1][i  ] = Cell.Road;
            board[j+2][i  ] = Cell.Road;
            j += 2;
            break;
          case Dir.Left:
            board[j  ][i-1] = Cell.Road;
            board[j  ][i-2] = Cell.Road;
            i -= 2;
            break;
          case Dir.Right:
            board[j  ][i+1] = Cell.Road;
            board[j  ][i+2] = Cell.Road;
            i += 2;
            break;
          default:
            throw new Error(`should not reach here`);
        }
        continue random_walk;
      }
    }
    break random_walk;
  }
  return true;
}

export class Maze {

  static init(board_size: [number, number]): void {
    function decide_board_size(size: [number, number]): [number, number] {
      let w: number = size[0];
      let h: number = size[1];
      w = w < 1 ? 1 : w;
      h = h < 1 ? 1 : h;
      return [2 * w + 1, 2 * h + 1];
    }
    const [w, h]: [number, number] = decide_board_size(board_size);
    const board: Cell[][] = [];
    for (let j: number = 0; j < h; j++) {
      const row: Cell[] = [];
      for (let i: number = 0; i < w; i++) {
        const val: Cell = 0 === i && 0 === j ? Cell.Road : Cell.Wall;
        row.push(val);
      }
      board.push(row);
    }
    while (init_board(board)) {};
    g_board = board;
    g_cursor = [0., 0.];
    g_cursor[0] = 0;
    g_cursor[1] = 0;
    g_path_pts = [];
    g_path_pts.push([g_cursor[0], g_cursor[1]]);
  }

  static move_cursor(dir: Dir): void {
    const h: number = g_board.length;
    const w: number = g_board[0].length;
    const i: number = g_cursor[0];
    const j: number = g_cursor[1];
    let delta: [number, number] = [0, 0];
    switch (dir) {
      case Dir.Bottom:
        if (0 === j) return;
        if (Cell.Wall === g_board[j-1][i  ]) return;
        delta[1] -= 1;
        break;
      case Dir.Top:
        if (h - 1 === j) return;
        if (Cell.Wall === g_board[j+1][i  ]) return;
        delta[1] += 1;
        break;
      case Dir.Left:
        if (0 === i) return;
        if (Cell.Wall === g_board[j  ][i-1]) return;
        delta[0] -= 1;
        break;
      case Dir.Right:
        if (w - 1 === i) return;
        if (Cell.Wall === g_board[j  ][i+1]) return;
        delta[0] += 1;
        break;
      default:
        throw new Error(`should not reach here`);
    }
    g_cursor[0] += delta[0];
    g_cursor[1] += delta[1];
    if (w - 1 === g_cursor[0] && h - 1 === g_cursor[1]) {
      g_done = true;
      Maze.init([w, h]);
      return;
    }
    // update path
    const nitems: number = g_path_pts.length;
    if (1 < nitems) {
      const last: [number, number] = g_path_pts[nitems - 2];
      if (last[0] === g_cursor[0] && last[1] === g_cursor[1]) {
        g_path_pts.pop();
        return;
      }
    }
    g_path_pts.push([g_cursor[0], g_cursor[1]]);
  }

  static draw(context: CanvasRenderingContext2D, screen_size: [number, number]): void {
    const board: Cell[][] = g_board;
    const h: number = board.length;
    const w: number = board[0].length;
    const dx: number = screen_size[0] / w;
    const dy: number = screen_size[1] / h;
    // maze
    context.fillStyle = `#ffffff`;
    for (let j: number = 0; j < h; j++) {
      for (let i: number = 0; i < w; i++) {
        if (Cell.Road === board[j][i]) {
          context.fillRect(
            i * dx,
            j * dy,
            dx,
            dy,
          );
        }
      }
    }
    // cursor, start, goal
    context.fillStyle   = `#ff0000`;
    context.strokeStyle = `#ff0000`;
    context.fillRect(
      g_cursor[0] * dx,
      g_cursor[1] * dy,
      dx,
      dy,
    );
    context.strokeRect(
      0 * dx,
      0 * dy,
      dx,
      dy,
    );
    context.strokeRect(
      (w - 1) * dx,
      (h - 1) * dy,
      dx,
      dy,
    );
    // path
    context.beginPath();
    context.moveTo(0.5 * dx, 0.5 * dx);
    for (const pt of g_path_pts) {
      const i: number = pt[0];
      const j: number = pt[1];
      context.lineTo(
        (0.5 + i) * dx,
        (0.5 + j) * dy,
      );
    }
    context.stroke();
  }

}

