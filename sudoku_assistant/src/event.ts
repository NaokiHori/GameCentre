import { Wrapper } from "./wrapper.js";
import { MyError } from "./myerror.js";
import { Mode, ModeType, ClassName as ModeClassName } from "./mode.js";
import { Board, BoardSize, ClassName as BoardClassName } from "./board.js";
import { ClassName as NumkeyClassName } from "./numkey.js";
import { CellAttr, CellMethod } from "./cell.js";

function assign_number_to_selected_cell(value: string): void {
  const cell: HTMLElement | null = Board.fetch_selected_cell();
  // check if a cell is selected
  if (!cell) {
    return;
  }
  const mode: ModeType = Mode.get_current_mode();
  // edit mode: just assign as requested
  if (mode === ModeType.Edit) {
    // if memo mode, clean-up memo first
    if (!CellMethod.is_normal_mode(cell)) {
      CellMethod.update_memo(cell, ` `);
    }
    CellMethod.change_mode(cell, true);
    CellMethod.update_text(cell, value);
    return;
  }
  // normal / memo modes
  // change is prohibited when this cell is original
  if (Wrapper.get_flag(cell, CellAttr.Original)) {
    return;
  }
  // normal mode, update cell text
  if (mode === ModeType.Normal) {
    // if memo mode, clean-up memo first
    if (!CellMethod.is_normal_mode(cell)) {
      CellMethod.update_memo(cell, ` `);
    }
    CellMethod.change_mode(cell, true);
    CellMethod.update_text(cell, value);
    return;
  }
  // memo mode, update memo texts
  if (mode === ModeType.Memo) {
    // if normal mode, clean-up text first
    // NOTE: do not clean-up memo as values might alreay there
    if (CellMethod.is_normal_mode(cell)) {
      CellMethod.update_text(cell, ` `);
    }
    CellMethod.change_mode(cell, false);
    CellMethod.update_memo(cell, value);
    return;
  }
  throw new Error(`${MyError.UnknownEnum}: ${mode}`);
}

export class ClickEvents {

  static initialise(): void {
    document.body.addEventListener(`click`, function (event: MouseEvent): void {
      const target: EventTarget | null = event.target;
      if (!target) {
        throw new Error(`${MyError.UnexpectedNull}: ${event}`);
      }
      if (!(target instanceof HTMLElement)) {
        throw new Error(`not an instance of HTMLElement: ${target}`);
      }
      let highlight_value: string = ` `;
      // consider all possible events
      if (target.classList.contains(ModeClassName)) {
        const modekey: HTMLElement = target as HTMLElement;
        // one of the modes is clicked
        // change mode and reset board when the edit mode is selected
        Mode.change(modekey);
        // change to editable mode: reset board
        if (Mode.get_current_mode() === ModeType.Edit) {
          Board.reset();
        }
      } else if (target.classList.contains(BoardClassName.Cell)) {
        // one of the cells is clicked
        // select the corresponding cell
        const cell: HTMLElement = target as HTMLElement;
        Board.select_cell(cell);
        highlight_value = Wrapper.get_textContent(CellMethod.get_text(cell));
      } else if (target.classList.contains(NumkeyClassName)) {
        const numkey: HTMLElement = target as HTMLElement;
        const value: string = Wrapper.get_textContent(numkey);
        assign_number_to_selected_cell(value);
        highlight_value = value;
      } else {
        // other place is clicked
        Board.unselect_cells();
      }
      // always update attributes after one of the events is invoked
      Board.refresh(highlight_value);
    });
  }

}

export class KeyboardEvents {

  static initialise(): void {
    document.addEventListener(`keydown`, function (event: KeyboardEvent) {
      let highlight_value: string = ` `;
      switch (event.key) {
        case `ArrowUp`:
        case `ArrowDown`:
        case `ArrowLeft`:
        case `ArrowRight`:
        case `k`:
        case `j`:
        case `h`:
        case `l`:
        case `w`:
        case `s`:
        case `a`:
        case `d`:
          {
            event.preventDefault();
            const ref_cell: HTMLElement | null = Board.fetch_selected_cell();
            if (!ref_cell) {
              break;
            }
            let [row, col]: [number, number] = CellMethod.get_pos(ref_cell);
            if (`ArrowUp` === event.key || `k` === event.key || `w` === event.key ) {
              row = (row + BoardSize.Main - 1) % BoardSize.Main;
            } else if (`ArrowDown` === event.key || `j` === event.key || `s` === event.key) {
              row = (row + BoardSize.Main + 1) % BoardSize.Main;
            }
            if (`ArrowLeft` === event.key || `h` === event.key || `a` === event.key) {
              col = (col + BoardSize.Main - 1) % BoardSize.Main;
            } else if (`ArrowRight` === event.key || `l` === event.key || `d` === event.key) {
              col = (col + BoardSize.Main + 1) % BoardSize.Main;
            }
            const cell: HTMLElement = Board.get_cell([row, col]);
            Board.select_cell(cell);
            highlight_value = Wrapper.get_textContent(CellMethod.get_text(cell));
            break;
          }
        case `1`:
        case `2`:
        case `3`:
        case `4`:
        case `5`:
        case `6`:
        case `7`:
        case `8`:
        case `9`:
          {
            const value: string = event.key;
            assign_number_to_selected_cell(value);
            highlight_value = value;
            break;
          }
        case `0`:
        case ` `:
        case `Backspace`:
        case `Delete`:
          {
            assign_number_to_selected_cell(` `);
            break;
          }
        case `E`:
          {
            Mode.change(ModeType.Edit);
            Board.reset();
            break;
          }
        case `N`:
          {
            Mode.change(ModeType.Normal);
            break;
          }
        case `M`:
          {
            Mode.change(ModeType.Memo);
            break;
          }
        case `R`:
          {
            if (Mode.get_current_mode() !== ModeType.Edit) {
              break;
            }
            Board.all_clear();
            break;
          }
        default:
          // otherwise N/A for now
          break;
      }
      // always update attributes after one of the events is invoked
      Board.refresh(highlight_value);
    });
  }

}
