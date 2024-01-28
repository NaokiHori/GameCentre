import { Wrapper } from "./wrapper.js";
import { MyError } from "./myerror.js";
import { Mode, ModeType } from "./mode.js";
import { CellAttr, CellMethod } from "./cell.js";
import { Sudoku } from "./sudoku.js";

export enum BoardSize {
  Main = 9,
  Sub = 3,
}

export enum ClassName {
  Cell = "cell",
  Text = "text",
  Memo = "memo",
  MemoText = "memotext",
}

export class Board {

  static fetch_selected_cell(): HTMLElement | null {
    const query: string = `div.${ClassName.Cell}[${CellAttr.Select}="${true}"]`;
    const board: HTMLElement = get_main_board();
    const cells: NodeListOf<HTMLElement> = board.querySelectorAll<HTMLElement>(query);
    const len: number = cells.length;
    if (1 < len) {
      throw new Error(`${MyError.UnexpectedNitems}, expected: [0, 1], length: ${len}`);
    }
    if (0 === len) {
      return null;
    }
    return cells[0];
  }

  static select_cell(cell: HTMLElement): void {
    Board.unselect_cells();
    Wrapper.set_flag(cell, CellAttr.Select, true);
  }

  static unselect_cells(): void {
    const cell: HTMLElement | null = Board.fetch_selected_cell();
    if (!cell) {
      return;
    }
    Wrapper.set_flag(cell, CellAttr.Select, false);
  }

  static refresh(value: string): void {
    // update attributes to keep the state of the board consistent
    const cells: NodeListOf<HTMLElement> = fetch_all_cells();
    autofill_memo(cells);
    remove_na_candidates(cells);
    update_highlight_flags(value, cells);
    update_original_flags(cells);
    update_only_flags(cells);
  }

  static reset(): void {
    // eliminate all except original cells
    Board.unselect_cells();
    for (const cell of fetch_all_cells()) {
      if (!Wrapper.get_flag(cell, CellAttr.Original)) {
        CellMethod.update_text(cell, ` `);
        CellMethod.update_memo(cell, ` `);
      }
    }
  }

  static all_clear(): void {
    Board.unselect_cells();
    for (const cell of fetch_all_cells()) {
      CellMethod.update_text(cell, ` `);
      CellMethod.update_memo(cell, ` `);
    }
  }

  static initialise(): void {
    // set edit mode
    Mode.change(ModeType.Edit);
    // make a random / sample puzzle
    // check if a URL param "create" is given
    //   if it is, create a new puzzle radomly
    //   otherwise use default fixed problem
    const url_params = new URLSearchParams(window.location.search);
    const create: boolean = url_params.has(`create`);
    const puzzle: string[] = Sudoku.init(create);
    // initialise all DOMs anyway
    // flags will be updated later
    const board: HTMLElement = get_main_board();
    for (let row: number = 0; row < BoardSize.Main; row++) {
      const elems: HTMLElement = Wrapper.create_and_append_div(board);
      for (let col: number = 0; col < BoardSize.Main; col++) {
        const cell: HTMLElement = Wrapper.create_and_append_div(elems);
        cell.classList.add(ClassName.Cell);
        CellMethod.set_pos(cell, [row, col]);
        Wrapper.set_flag(cell, CellAttr.Select,    false);
        Wrapper.set_flag(cell, CellAttr.Original,  false);
        Wrapper.set_flag(cell, CellAttr.Highlight, false);
        // normal cell, fill the given value and enabled
        const text: HTMLElement = Wrapper.create_and_append_div(cell);
        text.classList.add(ClassName.Text);
        text.textContent = puzzle[row * BoardSize.Main + col];
        // memo cell, empty and disabled
        const memo: HTMLElement = Wrapper.create_and_append_div(cell);
        memo.classList.add(ClassName.Memo);
        for (let memo_row: number = 0; memo_row < BoardSize.Sub; memo_row++) {
          const memotexts: HTMLElement = Wrapper.create_and_append_div(memo);
          for (let memo_col: number = 0; memo_col < BoardSize.Sub; memo_col++) {
            const memotext: HTMLElement = Wrapper.create_and_append_div(memotexts);
            memotext.classList.add(ClassName.MemoText);
            memotext.textContent = ` `;
            CellMethod.set_pos(memotext, [memo_row, memo_col]);
            Wrapper.set_flag(memotext, CellAttr.Highlight, false);
          }
        }
        CellMethod.change_mode(cell, true);
      }
    }
    // make everything consistent
    Board.refresh(` `);
    // recover normal mode
    Mode.change(ModeType.Normal);
  }

  static get_cell(pos: [number, number]): HTMLElement {
    const board: HTMLElement = get_main_board();
    const row: number = pos[0];
    const col: number = pos[1];
    const query: string = `div.${ClassName.Cell}[${CellAttr.Row}="${row}"][${CellAttr.Col}="${col}"]`;
    return Wrapper.querySelector(board, query);
  }

  static get_block_range(n: number): [number, number] {
    let min: number = 0;
    if (n < 1 * BoardSize.Sub) {
      min = 0 * BoardSize.Sub;
    } else if (n < 2 * BoardSize.Sub) {
      min = 1 * BoardSize.Sub;
    } else {
      min = 2 * BoardSize.Sub;
    }
    const max: number = min + BoardSize.Sub;
    return [min, max];
  }

}

function get_main_board(): HTMLElement {
  const id: string = `board`;
  const board: HTMLElement | null = document.getElementById(id);
  if (!board) {
    throw new Error(`${MyError.UnexpectedNull}: getElementById(${id})`);
  }
  return board;
}

function fetch_all_cells(): NodeListOf<HTMLElement> {
  const board: HTMLElement = get_main_board();
  const query: string = `div.${ClassName.Cell}`;
  return Wrapper.querySelectorAll(board, BoardSize.Main * BoardSize.Main, query);
}

function autofill_memo(cells: NodeListOf<HTMLElement>) {
  // since this function overrides all memo,
  //   this is to be invoked only when the mode is edit
  if (Mode.get_current_mode() !== ModeType.Edit) {
    return;
  }
  // fill memo automatically
  for (const cell of cells) {
    // if the cell is normal and not empty, do nothing
    if (CellMethod.is_normal_mode(cell)) {
      // check if a number is given
      const text: HTMLElement = CellMethod.get_text(cell);
      const value: string = Wrapper.get_textContent(text);
      if (` ` !== value) {
        continue;
      }
    }
    // this is a normal and an empty cell, memo to be filled
    CellMethod.update_text(cell, ` `);
    CellMethod.change_mode(cell, false);
    const query: string = `div.${ClassName.MemoText}`;
    const memotexts: NodeListOf<HTMLElement> = Wrapper.querySelectorAll(cell, BoardSize.Main, query);
    for (const memotext of memotexts) {
      const [row, col]: [number, number] = CellMethod.get_pos(memotext);
      const value: number = row * BoardSize.Sub + col + 1;
      memotext.textContent = `${value}`;
    }
  }
}

function remove_na_candidates(cells: NodeListOf<HTMLElement>): void {
  // eliminate memo which overlaps with the cells
  //   on the same row, column and in the same block
  function check_and_update(value: string, pos: [number, number]): void {
    if (` ` === value) {
      throw new Error(`empty value is not accepted here`);
    }
    const cell: HTMLElement = Board.get_cell(pos);
    // check if this cell is memo
    if (CellMethod.is_normal_mode(cell)) {
      return;
    }
    const n: number = Number(value) - 1;
    const row: number = n < 1 * BoardSize.Sub ? 0 : n < 2 * BoardSize.Sub ? 1 : 2;
    const col: number = n - BoardSize.Sub * row;
    const query: string = `div.${ClassName.MemoText}[${CellAttr.Row}="${row}"][${CellAttr.Col}="${col}"]`;
    const memotext: HTMLElement = Wrapper.querySelector(cell, query);
    memotext.textContent = ` `;
  }
  for (const ref_cell of cells) {
    // check if this cell is normal
    if (!CellMethod.is_normal_mode(ref_cell)) {
      continue;
    }
    const ref_text: HTMLElement = CellMethod.get_text(ref_cell);
    const ref_value: string = Wrapper.get_textContent(ref_text);
    if (` ` === ref_value) {
      continue;
    }
    // check the same row
    const [ref_row, ref_col]: [number, number] = CellMethod.get_pos(ref_cell);
    for (let col: number = 0; col < BoardSize.Main; col++) {
      check_and_update(ref_value, [ref_row, col]);
    }
    // check the same col
    for (let row: number = 0; row < BoardSize.Main; row++) {
      check_and_update(ref_value, [row, ref_col]);
    }
    // check the same block
    const [rowmin, rowmax]: [number, number] = Board.get_block_range(ref_row);
    const [colmin, colmax]: [number, number] = Board.get_block_range(ref_col);
    for (let row: number = rowmin; row < rowmax; row++) {
      for (let col: number = colmin; col < colmax; col++) {
        check_and_update(ref_value, [row, col]);
      }
    }
  }
}

function update_highlight_flags(ref_value: string, cells: NodeListOf<HTMLElement>): void {
  // reset highlight first, including memos
  {
    const query: string = `div[${CellAttr.Highlight}="${true}"]`;
    const board: HTMLElement = get_main_board();
    const elems: NodeListOf<HTMLElement> = board.querySelectorAll<HTMLElement>(query);
    for (const elem of elems) {
      Wrapper.set_flag(elem, CellAttr.Highlight, false);
    }
  }
  // check valid number is given
  if (` ` === ref_value) {
    return;
  }
  // iterate over all cells and update flag
  for (const cell of cells) {
    if (CellMethod.is_normal_mode(cell)) {
      // normal cell: highlight cell if it has the specified number
      const text: HTMLElement = CellMethod.get_text(cell);
      const value: string = Wrapper.get_textContent(text);
      Wrapper.set_flag(cell, CellAttr.Highlight, ref_value === value);
    } else {
      // memo cell: unhighlight parent cell, highlight memotext if it has the specified number
      Wrapper.set_flag(cell, CellAttr.Highlight, false);
      const memotexts: NodeListOf<HTMLElement> = CellMethod.get_memotexts(cell);
      for (const memotext of memotexts) {
        const value: string = Wrapper.get_textContent(memotext);
        Wrapper.set_flag(memotext, CellAttr.Highlight, ref_value === value);
      }
    }
  }
}

function update_original_flags(cells: NodeListOf<HTMLElement>): void {
  // update original-cell flags when the board is editable
  // assume non-zero values as the initial (fixed) values
  if (Mode.get_current_mode() !== ModeType.Edit) {
    return;
  }
  for (const cell of cells) {
    const text: HTMLElement = CellMethod.get_text(cell);
    Wrapper.set_flag(cell, CellAttr.Original, ` ` !== Wrapper.get_textContent(text));
  }
}

function update_only_flags(cells: NodeListOf<HTMLElement>): void {
  // reset first
  {
    const query: string = `div[${CellAttr.Only}="${true}"]`;
    const board: HTMLElement = get_main_board();
    const elems: NodeListOf<HTMLElement> = board.querySelectorAll<HTMLElement>(query);
    for (const elem of elems) {
      Wrapper.set_flag(elem, CellAttr.Only, false);
    }
  }
  // extract memo cells
  let memocells: HTMLElement[] = Array();
  for (const cell of cells) {
    if (CellMethod.is_normal_mode(cell)) {
      continue;
    }
    memocells.push(cell);
  }
  // check each memo cell, highlight if only one active memo text exists
  for (const cell of memocells) {
    const memotexts: NodeListOf<HTMLElement> = CellMethod.get_memotexts(cell);
    let counter: number = 0;
    for (const memotext of memotexts) {
      const value: string = Wrapper.get_textContent(memotext);
      if (` ` !== value) {
        counter += 1;
      }
    }
    if (1 === counter) {
      for (const memotext of memotexts) {
        const value: string = Wrapper.get_textContent(memotext);
        if (` ` === value) {
          continue;
        }
        Wrapper.set_flag(memotext, CellAttr.Only, true);
      }
    }
  }
  function check_and_set_only(sub_cells: HTMLElement[]): void {
    // allocate 10 elements so that the index coincides with the value
    let counters: number[] = Array(BoardSize.Main + 1).fill(0);
    for (const cell of sub_cells) {
      const memotexts: NodeListOf<HTMLElement> = CellMethod.get_memotexts(cell);
      for (const memotext of memotexts) {
        const value: string = Wrapper.get_textContent(memotext);
        if (` ` !== value) {
          counters[Number(value)] += 1;
        }
      }
    }
    for (const [index, counter] of counters.entries()) {
      if (0 === index) {
        continue;
      }
      if (1 !== counter) {
        continue;
      }
      for (const cell of sub_cells) {
        const memotexts: NodeListOf<HTMLElement> = CellMethod.get_memotexts(cell);
        for (const memotext of memotexts) {
          const value: string = Wrapper.get_textContent(memotext);
          if (` ` === value) {
            continue;
          }
          if (Number(value) !== index) {
            continue;
          }
          Wrapper.set_flag(memotext, CellAttr.Only, true);
        }
      }
    }
  }
  // check each row, column, and block to highlight unique memo texts if exist
  for (let row: number = 0; row < BoardSize.Main; row++) {
    let sub_cells: HTMLElement[] = Array();
    for (const cell of memocells) {
      if (row === CellMethod.get_pos(cell)[0]) {
        sub_cells.push(cell);
      }
    }
    check_and_set_only(sub_cells);
  }
  for (let col: number = 0; col < BoardSize.Main; col++) {
    let sub_cells: HTMLElement[] = Array();
    for (const cell of memocells) {
      if (col === CellMethod.get_pos(cell)[1]) {
        sub_cells.push(cell);
      }
    }
    check_and_set_only(sub_cells);
  }
  const nblocks = BoardSize.Main / BoardSize.Sub;
  for (let block_row: number = 0; block_row < nblocks; block_row++) {
    for (let block_col: number = 0; block_col < nblocks; block_col++) {
      let sub_cells: HTMLElement[] = Array();
      for (const cell of memocells) {
        const [row, col]: [number, number] = CellMethod.get_pos(cell);
        if (row < block_row * BoardSize.Sub) {
          continue;
        }
        if ((block_row + 1) * BoardSize.Sub <= row) {
          continue;
        }
        if (col < block_col * BoardSize.Sub) {
          continue;
        }
        if ((block_col + 1) * BoardSize.Sub <= col) {
          continue;
        }
        sub_cells.push(cell);
      }
      check_and_set_only(sub_cells);
    }
  }
}

