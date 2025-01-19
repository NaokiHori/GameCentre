export const EMPTY_VALUE = 0;

export const SUDOKU_VALUES = [EMPTY_VALUE, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
export type SudokuValue = (typeof SUDOKU_VALUES)[number];

export function isEmpty(value: SudokuValue) {
  return EMPTY_VALUE === value;
}
