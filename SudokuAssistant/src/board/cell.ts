import { createChildElement } from "../dom";
import { Position } from "./position";
import {
  EMPTY_VALUE,
  SUDOKU_VALUES,
  SudokuValue,
  isEmpty,
} from "../sudokuValue";

type CellMode = "Normal" | "Memo";

const DEFAULT_CELL_MODE: CellMode = "Memo";

export class Cell {
  private readonly _position: Position;
  private readonly _cellElement: HTMLDivElement;
  private readonly _cellTextElement: HTMLDivElement;
  private readonly _subCellElements: ReadonlyArray<HTMLDivElement>;
  private readonly _subCellValuesValid: Array<boolean>;
  private readonly _subCellValuesUnique: Array<boolean>;
  private readonly _subCellValuesDisabled: Array<boolean>;
  private _value: SudokuValue;
  private _isDefault: boolean;
  private _isSelected: boolean;
  private _cellMode: CellMode;
  public neighborCells: {
    sameRow: Array<Cell>;
    sameColumn: Array<Cell>;
    sameBlock: Array<Cell>;
  };

  public constructor(containerElement: HTMLElement, position: Position) {
    // element to contain
    //   1. normal value
    //   2. nine memo values
    const cellElement = createChildElement({
      tagName: "div",
      parentElement: containerElement,
      classListItems: ["cell"],
      attributes: [
        { key: "cellMode", value: DEFAULT_CELL_MODE },
        { key: "row", value: position.row.toString() },
        { key: "column", value: position.column.toString() },
        { key: "isHighlighted", value: false.toString() },
        { key: "isSelected", value: false.toString() },
      ],
    }) as HTMLDivElement;
    // element to keep normal value, which is vertically centered
    const cellTextElement = createChildElement({
      tagName: "div",
      parentElement: cellElement,
      classListItems: ["text"],
      attributes: [],
    }) as HTMLDivElement;
    // elements to keep memo values
    // NOTE: include a dummy element (0-th element) for convenience,
    //   which is hidden by configuring "display: none"
    const subCellElements = SUDOKU_VALUES.map((sudokuValue: SudokuValue) => {
      const subCellElement = createChildElement({
        tagName: "div",
        parentElement: cellElement,
        classListItems: ["subcell"],
        attributes: [
          { key: "isHighlighted", value: false.toString() },
          { key: "isUnique", value: false.toString() },
          { key: "isDisabled", value: false.toString() },
        ],
      }) as HTMLDivElement;
      const subCellTextElement = createChildElement({
        tagName: "div",
        parentElement: subCellElement,
        classListItems: ["text"],
        attributes: [],
      }) as HTMLDivElement;
      subCellTextElement.textContent = sudokuValue.toString();
      if (isEmpty(sudokuValue)) {
        subCellElement.style.display = "none";
      }
      return subCellElement;
    });
    this._position = position;
    this._cellElement = cellElement;
    this._cellTextElement = cellTextElement;
    this._subCellElements = subCellElements;
    // initially assume all candidates are valid
    this._subCellValuesValid = new Array<boolean>(SUDOKU_VALUES.length).fill(
      true,
    );
    this._subCellValuesUnique = new Array<boolean>(SUDOKU_VALUES.length).fill(
      false,
    );
    this._subCellValuesDisabled = new Array<boolean>(SUDOKU_VALUES.length).fill(
      false,
    );
    this._value = EMPTY_VALUE;
    this._isDefault = false;
    this._isSelected = false;
    this._cellMode = DEFAULT_CELL_MODE;
    this.neighborCells = {
      sameRow: new Array<Cell>(),
      sameColumn: new Array<Cell>(),
      sameBlock: new Array<Cell>(),
    };
  }

  public setOnClickHandler(handler: (cellValue: SudokuValue) => void) {
    this._cellElement.addEventListener("click", (event: Event) => {
      // disable the body element click event
      event.stopPropagation();
      // invoke passed handler
      handler(this.value);
      // select this cell
      this.isSelected = true;
    });
  }

  public reset() {
    this.isDefault = false;
    this.isSelected = false;
    this.cellMode = DEFAULT_CELL_MODE;
    this.value = EMPTY_VALUE;
    for (const value of SUDOKU_VALUES) {
      this.setSubCellValidity(value, true);
      this.setSubCellUniqueness(value, false);
      this.setSubCellDisability(value, false);
    }
  }

  public get value(): SudokuValue {
    return this._value;
  }

  public set value(value: SudokuValue) {
    this._value = value;
    this._cellTextElement.textContent = isEmpty(value) ? "" : value.toString();
  }

  public get isSelected(): boolean {
    return this._isSelected;
  }

  public set isSelected(flag: boolean) {
    this._isSelected = flag;
    this._cellElement.setAttribute("isSelected", flag.toString());
  }

  public set isHighlighted(flag: boolean) {
    this._cellElement.setAttribute("isHighlighted", flag.toString());
  }

  public get isDefault(): boolean {
    return this._isDefault;
  }

  public set isDefault(flag: boolean) {
    this._isDefault = flag;
    this._cellElement.setAttribute("isDefault", flag.toString());
  }

  public get cellMode(): CellMode {
    return this._cellMode;
  }

  public set cellMode(cellMode: CellMode) {
    this._cellMode = cellMode;
    this._cellElement.setAttribute("cellMode", cellMode);
  }

  public get position(): Position {
    return this._position;
  }

  public getSubCellValidity(value: SudokuValue): boolean {
    return this._subCellValuesValid[value];
  }

  public setSubCellValidity(value: SudokuValue, isValid: boolean) {
    this._subCellValuesValid[value] = isValid;
    this._subCellElements[value].setAttribute("isValid", isValid.toString());
  }

  public getSubCellDisability(value: SudokuValue): boolean {
    return this._subCellValuesDisabled[value];
  }

  public setSubCellDisability(value: SudokuValue, isDisabled: boolean) {
    this._subCellValuesDisabled[value] = isDisabled;
    this._subCellElements[value].setAttribute(
      "isDisabled",
      isDisabled.toString(),
    );
  }

  public highlightSubCell(value: SudokuValue) {
    for (const sudokuValue of SUDOKU_VALUES) {
      this._subCellElements[sudokuValue].setAttribute(
        "isHighlighted",
        (sudokuValue === value).toString(),
      );
    }
  }

  public validate(newValue: SudokuValue): boolean {
    // fetch all neighbor cells
    const neighborCells = this.neighborCells;
    for (const neighborCell of neighborCells.sameRow) {
      if (neighborCell.value === newValue) {
        return false;
      }
    }
    for (const neighborCell of neighborCells.sameColumn) {
      if (neighborCell.value === newValue) {
        return false;
      }
    }
    for (const neighborCell of neighborCells.sameBlock) {
      if (neighborCell.value === newValue) {
        return false;
      }
    }
    return true;
  }

  public resetDisabledMemoValues() {
    for (const sudokuValue of SUDOKU_VALUES) {
      this.setSubCellDisability(sudokuValue, false);
    }
  }

  public validateAndUpdateMemoValues() {
    // for each value, check if it is a valid candidate
    //   (by checking neighbor cells)
    //   and update the flag
    for (const sudokuValue of SUDOKU_VALUES) {
      this.setSubCellValidity(sudokuValue, this.validate(sudokuValue));
    }
  }

  public updateUniquenessOfMemoValues() {
    if (this.cellMode !== "Memo") {
      return;
    }
    for (const sudokuValue of SUDOKU_VALUES) {
      // reset uniqueness to be false (default)
      this.setSubCellUniqueness(sudokuValue, false);
      if (isEmpty(sudokuValue)) {
        // we are only interested in non-empty value
        continue;
      }
      if (!this.getSubCellValidity(sudokuValue)) {
        // this memo value is no longer applicable
        continue;
      }
      // check if this value is the only candidate in this cell
      if (this.isOnlyCandidate(sudokuValue)) {
        this.setSubCellUniqueness(sudokuValue, true);
      }
      const neighborCells = this.neighborCells;
      if (
        neighborCells.sameRow.every((neighborCell: Cell) =>
          isUnshared(sudokuValue, neighborCell),
        ) ||
        neighborCells.sameColumn.every((neighborCell: Cell) =>
          isUnshared(sudokuValue, neighborCell),
        ) ||
        neighborCells.sameBlock.every((neighborCell: Cell) =>
          isUnshared(sudokuValue, neighborCell),
        )
      ) {
        this.setSubCellUniqueness(sudokuValue, true);
      }
    }
  }

  private setSubCellUniqueness(value: SudokuValue, isUnique: boolean) {
    this._subCellValuesUnique[value] = isUnique;
    this._subCellElements[value].setAttribute("isUnique", isUnique.toString());
  }

  private isOnlyCandidate(value: SudokuValue): boolean {
    for (const sudokuValue of SUDOKU_VALUES) {
      if (sudokuValue === value) {
        continue;
      }
      if (!this.getSubCellValidity(sudokuValue)) {
        continue;
      }
      if (this.getSubCellDisability(sudokuValue)) {
        continue;
      }
      return false;
    }
    return true;
  }
}

// check uniqueness with respect to neighbor cells
function isUnshared(sudokuValue: SudokuValue, neighborCell: Cell): boolean {
  if (neighborCell.cellMode !== "Memo") {
    return true;
  }
  if (!neighborCell.getSubCellValidity(sudokuValue)) {
    return true;
  }
  if (neighborCell.getSubCellDisability(sudokuValue)) {
    return true;
  }
  return false;
}
