export const EMPTY_VALUE = 0;

export const sudokuValues = [EMPTY_VALUE, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
export type SudokuValue = (typeof sudokuValues)[number];

export function isEmpty(value: SudokuValue) {
  return EMPTY_VALUE === value;
}
