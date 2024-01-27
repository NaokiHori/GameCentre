import { Wrapper } from "./wrapper.js";
import { Board, BoardSize } from "./board.js";
import { CellMethod } from "./cell.js";

export class Sudoku {

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
      alert("This Sudoku has no solution");
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

function from_index_to_pos(index: number): [number, number] {
  const row: number = Math.floor(index / BoardSize.Main);
  const col: number = index % BoardSize.Main;
  return [row, col];
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
    // try all candidates for this cell
    for (let cand: number = 1; cand < BoardSize.Main + 1; cand++) {
      if (check_and_assign(vals, index, cand)) {
        // valid, move forward
        if (fill_at(vals, indices, cnt + 1)) {
          // done, success
          return true;
        } else {
          // failed somewhere in the future, indicating this candidate is N/A
          // reset this cell and try the other candidate
          vals[index] = 0;
        }
      }
    }
    // no valid applicant, this Sudoku has no answer
    // go back recursion
    return false;
  }
  // check number of solutions of the given sudoku
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

