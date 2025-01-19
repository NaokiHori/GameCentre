import { EditModes } from "./editMode";
import { NumberButtons } from "./numberButton";
import { SudokuValue, SUDOKU_VALUES, EMPTY_VALUE } from "./sudokuValue";
import { Board } from "./board";

export function setKeyboardEvents(
  key: string,
  board: Board,
  editModes: EditModes,
  numberButtons: NumberButtons,
) {
  // handle numbers first
  const value = Number(key);
  if (value in SUDOKU_VALUES) {
    numberButtons.select(value as SudokuValue);
  } else {
    // no number
    switch (key) {
      case " ":
      case "Backspace":
      case "Delete": {
        numberButtons.select(EMPTY_VALUE);
        break;
      }
      case "i":
      case "I": {
        editModes.changeTo("Init");
        break;
      }
      case "n":
      case "N": {
        editModes.changeTo("Normal");
        break;
      }
      case "m":
      case "M": {
        editModes.changeTo("Memo");
        break;
      }
      case "r":
      case "R": {
        if ("Init" === editModes.currentMode) {
          board.reset();
        } else {
          console.log("Cannot reset board unless the current mode is 'Init'");
        }
        break;
      }
      case "ArrowDown":
      case "j": {
        board.updateSelectedCell("Down");
        break;
      }
      case "ArrowUp":
      case "k": {
        board.updateSelectedCell("Up");
        break;
      }
      case "ArrowLeft":
      case "h": {
        board.updateSelectedCell("Left");
        break;
      }
      case "ArrowRight":
      case "l": {
        board.updateSelectedCell("Right");
        break;
      }
      default: {
        console.log(`No keyboard event is implemented for ${key}`);
      }
    }
  }
}
