import { MyError } from "./myerror.js";
import { Wrapper } from "./wrapper.js";
import { BoardSize, ClassName as BoardClassName } from "./board.js";

export enum CellAttr {
  Select    = `select`,
  Highlight = `highlight`,
  Original  = `original`,
  Only      = `only`,
  Row       = `row`,
  Col       = `col`,
}

export class CellMethod {

  static get_pos(cell: HTMLElement): [number, number] {
    const row: string | null = cell.getAttribute(CellAttr.Row);
    const col: string | null = cell.getAttribute(CellAttr.Col);
    if (!row) {
      throw new Error(`${MyError.AttributeNotFound}: ${CellAttr.Row} in ${cell}`);
    }
    if (!col) {
      throw new Error(`${MyError.AttributeNotFound}: ${CellAttr.Col} in ${cell}`);
    }
    return [Number(row), Number(col)];
  }

  static set_pos(cell: HTMLElement, pos: [number, number]): void {
    cell.setAttribute(CellAttr.Row, pos[0].toString());
    cell.setAttribute(CellAttr.Col, pos[1].toString());
  }

  static get_text(cell: HTMLElement): HTMLElement {
    const query: string = `div.${BoardClassName.Text}`;
    return Wrapper.querySelector(cell, query);
  }

  static get_memo(cell: HTMLElement): HTMLElement {
    const query: string = `div.${BoardClassName.Memo}`;
    return Wrapper.querySelector(cell, query);
  }

  static get_memotexts(cell: HTMLElement): NodeListOf<HTMLElement> {
    const query: string = `div.${BoardClassName.MemoText}`;
    return Wrapper.querySelectorAll(cell, BoardSize.Main, query);
  }

  static update_text(cell: HTMLElement, value: string): void {
    const query: string = `div.${BoardClassName.Text}`;
    const text: HTMLElement = Wrapper.querySelector(cell, query);
    text.textContent = value;
  }

  static update_memo(cell: HTMLElement, value: string): void {
    if (` ` === value) {
      // clean all values
      const query: string = `div.${BoardClassName.MemoText}`;
      const memotexts: NodeListOf<HTMLElement> = Wrapper.querySelectorAll(cell, BoardSize.Main, query);
      for (const memotext of memotexts) {
        memotext.textContent = ` `;
      }
    } else {
      // flip the textContent of the memo at the specified position
      const n: number = Number(value) - 1;
      const row: number = n < 1 * BoardSize.Sub ? 0 : n < 2 * BoardSize.Sub ? 1 : 2;
      const col: number = n - BoardSize.Sub * row;
      const query: string = `div.${BoardClassName.MemoText}[${CellAttr.Row}="${row}"][${CellAttr.Col}="${col}"]`;
      const memotext: HTMLElement = Wrapper.querySelector(cell, query);
      const memo_value: string = Wrapper.get_textContent(memotext);
      memotext.textContent = ` ` === memo_value ? `${value}` : ` `;
    }
  }

  static is_normal_mode(cell: HTMLElement): boolean {
    const text: HTMLElement = CellMethod.get_text(cell);
    const memo: HTMLElement = CellMethod.get_memo(cell);
    const th: boolean = text.hidden;
    const mh: boolean = memo.hidden;
    if (th === mh) {
      throw new Error(`strange hidden flags, text.hidden: ${th}, memo.hidden: ${mh}`);
    }
    // memo is hidden = this cell is in the normal mode
    return mh;
  }

  static change_mode(cell: HTMLElement, to_normal: boolean): void {
    const text: HTMLElement = CellMethod.get_text(cell);
    const memo: HTMLElement = CellMethod.get_memo(cell);
    if (to_normal) {
      CellMethod.update_memo(cell, ` `);
    } else {
      CellMethod.update_text(cell, ` `);
    }
    text.hidden = !to_normal;
    memo.hidden =  to_normal;
  }

}
