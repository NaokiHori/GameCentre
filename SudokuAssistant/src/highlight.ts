import { highlightButton } from "./number-button";
import { highlightBoard } from "./board";
import { EMPTY_VALUE, SudokuValue } from "./sudoku-value";

let highlightedValue: SudokuValue = EMPTY_VALUE;

export function getHighlightedValue(): SudokuValue {
  return highlightedValue;
}

export function setHighlightedValue(value: SudokuValue) {
  highlightedValue = value;
  highlightButton();
  highlightBoard();
}
