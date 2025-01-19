import { EMPTY_VALUE, SudokuValue } from "./sudokuValue";

export class Highlight {
  private _highlightedValue: SudokuValue;
  private _onUpdateHandler: (highlightedValue: SudokuValue) => void;

  public constructor() {
    this._highlightedValue = EMPTY_VALUE;
    this._onUpdateHandler = () => {
      /* will be registered by the "value" setter */
    };
  }

  public setOnUpdateHandler(
    onUpdateHandler: (highlightedValue: SudokuValue) => void,
  ) {
    this._onUpdateHandler = onUpdateHandler;
  }

  public get value(): SudokuValue {
    return this._highlightedValue;
  }

  public set value(highlightedValue: SudokuValue) {
    this._highlightedValue = highlightedValue;
    this._onUpdateHandler(highlightedValue);
  }
}
