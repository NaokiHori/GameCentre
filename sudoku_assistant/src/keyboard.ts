import { changeEditMode } from "./edit-mode";
import { clickButton } from "./number-button";
import { SudokuValue, sudokuValues, EMPTY_VALUE } from "./sudoku-value";
import { updateSelectedCell } from "./board";

export function initializeKeyboardEvents() {
  document.addEventListener("keydown", (event: KeyboardEvent) => {
    const key: string = event.key;
    // handle numbers
    const value = Number(key);
    if (value in sudokuValues) {
      clickButton(value as SudokuValue);
    } else {
      switch (key) {
        case " ":
        case "Backspace":
        case "Delete": {
          clickButton(EMPTY_VALUE);
          break;
        }
        case "i":
        case "I": {
          changeEditMode("Init");
          break;
        }
        case "n":
        case "N": {
          changeEditMode("Normal");
          break;
        }
        case "m":
        case "M": {
          changeEditMode("Memo");
          break;
        }
        case "ArrowDown":
        case "j": {
          updateSelectedCell("Down");
          break;
        }
        case "ArrowUp":
        case "k": {
          updateSelectedCell("Up");
          break;
        }
        case "ArrowLeft":
        case "h": {
          updateSelectedCell("Left");
          break;
        }
        case "ArrowRight":
        case "l": {
          updateSelectedCell("Right");
          break;
        }
        default: {
          console.log(`no keyboard events are implemented for ${key}`);
        }
      }
    }
  });
}
