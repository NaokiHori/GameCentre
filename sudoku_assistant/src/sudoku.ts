import { Wrapper } from "./wrapper.js";
import { Board, BoardSize } from "./board.js";
import { CellMethod } from "./cell.js";

export class Sudoku {

  static init(create_flag: boolean): string[] {
    if (create_flag) {
      // make a filled puzzle by using a solver (apply solver to an empty puzzle)
      const vals: number[] = Array(BoardSize.Main * BoardSize.Main).fill(0);
      const success: boolean = solve(vals);
      if (!success) {
        console.log(`creation failed`);
        return get_default_puzzle();
      }
      // try to remove elements
      // first decide the order to visit
      const indices: number[] = Array
        .from({ length: BoardSize.Main * BoardSize.Main }, (_, index) => index)
        .sort(() => Math.random() - 0.5);
      for (const index of indices) {
        // pick-up the value here
        const val: number = vals[index];
        if (0 === val) {
          throw new Error(`should not visit empty element: ${vals}`);
        }
        // tentatively remove it
        vals[index] = 0;
        // see if the puzzle is still valid (uniqueness of the solution)
        const nsols: number = count_number_of_solutions(vals);
        if (0 === nsols) {
          console.log(`no solution exists: ${vals}`);
          console.log(`creation failed`);
          return get_default_puzzle();
        } else if (1 < nsols) {
          // multiple answers exist, push back the original value
          vals[index] = val;
        }
      }
      // convert numbers to chars, for later convenience
      return convert_numbers_to_chars(vals);
    } else {
      return get_default_puzzle();
    }
  }

  static solve(): void {
    // extract all numbers from the board
    // candidates / empty cells are filled with 0
    const vals: number[] = [];
    for (let row: number = 0; row < BoardSize.Main; row++) {
      for (let col: number = 0; col < BoardSize.Main; col++) {
        const cell: HTMLElement = Board.get_cell([row, col]);
        let val: number = 0;
        if (CellMethod.is_normal_mode(cell)) {
          const text: HTMLElement = CellMethod.get_text(cell);
          const num: string = Wrapper.get_textContent(text);
          if (` ` !== num) {
            val = Number(num);
          }
        }
        vals.push(val);
      }
    }
    // replace all 0 by solving sudoku
    const success: boolean = solve(vals);
    if (!success) {
      alert(`This Sudoku has no solution`);
    }
    // reflect results to HTML
    for (const [index, val] of vals.entries()) {
      const [row, col]: [number, number] = from_index_to_pos(index);
      const cell: HTMLElement = Board.get_cell([row, col]);
      CellMethod.change_mode(cell, true);
      CellMethod.update_text(cell, val.toString());
    }
  }

}

function count_number_of_solutions(vals: number[]): number {
  // count number of solution of a puzzle by solving it
  function fill_at (
    nsols: number,
    vals: number[],
    indices: number[],
    cnt: number
  ): number {
    const nitems: number = indices.length;
    if (nitems === cnt) {
      // a new solution is found
      return nsols + 1;
    }
    const index: number = indices[cnt];
    // try all candidates for this cell
    // make a list having [1 : BoardSize.Main] in a random order
    const cands: number[] = Array
      .from({ length: BoardSize.Main }, (_, index) => index + 1)
      .sort(() => Math.random() - 0.5);
    for (const cand of cands) {
      if (check_and_assign(vals, index, cand)) {
        // valid, move forward
        nsols = fill_at(nsols, vals, indices, cnt + 1);
        // reset this cell and try the other candidate
        vals[index] = 0;
      }
    }
    return nsols;
  }
  // find non-zero cells
  const indices: number[] = [];
  for (const [index, val] of vals.entries()) {
    if (0 === val) {
      indices.push(index);
    }
  }
  if (0 === indices.length) {
    // already all filled (unique solution)
    return 1;
  }
  return fill_at(0, vals, indices, 0);
}

function solve(vals: number[]): boolean {
  // solve Sudoku
  // NOTE: if the puzzle has multiple answers,
  //   the first-hit result will be returned
  //   and the other solutions are ignored
  function fill_at (
    vals: number[],
    indices: number[],
    cnt: number
  ): boolean {
    // try to fill vals at indices[cnt]
    const nitems: number = indices.length;
    if (nitems === cnt) {
      // reached the end of the to-be-filled list
      // success
      return true;
    }
    const index: number = indices[cnt];
    // try all candidates ([1 : BoardSize.Main], random order) for this cell
    const cands: number[] = Array
      .from({ length: BoardSize.Main }, (_, index) => index + 1)
      .sort(() => - 0.5 + Math.random());
    for (const cand of cands) {
      if (check_and_assign(vals, index, cand)) {
        // valid, move forward
        if (fill_at(vals, indices, cnt + 1)) {
          // done, success
          return true;
        } else {
          // failed at a later point, indicatng this candidate is N/A
          // reset this cell and try the other candidate
          vals[index] = 0;
        }
      }
    }
    // no valid applicant, this Sudoku has no answer
    // go back recursion
    return false;
  }
  // find non-zero cells
  const indices: number[] = [];
  for (const [index, val] of vals.entries()) {
    if (0 === val) {
      indices.push(index);
    }
  }
  if (0 === indices.length) {
    // already all filled, success
    return true;
  }
  return fill_at(vals, indices, 0);
}

// check if the board keeps it validity even after
//   the new value will be assigned
// assign the new value if it is
function check_and_assign (
    vals: number[],
    index: number,
    val: number
): boolean {
  const [ref_row, ref_col]: [number, number] = from_index_to_pos(index);
  // check overlap for the same row
  for (let row = 0; row < BoardSize.Main; row++) {
    if (ref_row === row) {
      continue;
    }
    if (val === vals[row * BoardSize.Main + ref_col]) {
      return false;
    }
  }
  // check overlap for the same column
  for (let col = 0; col < BoardSize.Main; col++) {
    if (ref_col === col) {
      continue;
    }
    if (val === vals[ref_row * BoardSize.Main + col]) {
      return false;
    }
  }
  // check overlap for the same block
  const [rowmin, rowmax]: [number, number] = Board.get_block_range(ref_row);
  const [colmin, colmax]: [number, number] = Board.get_block_range(ref_col);
  for (let row: number = rowmin; row < rowmax; row++) {
    for (let col: number = colmin; col < colmax; col++) {
      if (ref_row === row && ref_col === col) {
        continue;
      }
      if (val === vals[row * BoardSize.Main + col]) {
        return false;
      }
    }
  }
  vals[index] = val;
  return true;
}

function from_index_to_pos(index: number): [number, number] {
  const row: number = Math.floor(index / BoardSize.Main);
  const col: number = index % BoardSize.Main;
  return [row, col];
}

function get_default_puzzle(): string[] {
  return convert_numbers_to_chars([
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 7, 6, 0, 4, 0,
    0, 0, 0, 0, 2, 0, 1, 0, 3,
    0, 0, 0, 0, 0, 9, 0, 6, 0,
    0, 0, 3, 0, 0, 0, 0, 0, 1,
    9, 5, 0, 0, 6, 4, 0, 3, 7,
    0, 1, 0, 0, 0, 0, 0, 7, 5,
    6, 0, 8, 1, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 2, 0, 0, 0,
  ]);
}

function convert_numbers_to_chars(vals: number[]): string[] {
  const puzzle: string[] = [];
  for (const val of vals) {
    let str: string = ` `;
    if (0 !== val) {
      str = `${val}`
    }
    puzzle.push(str);
  }
  return puzzle;
}

