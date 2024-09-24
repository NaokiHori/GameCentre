import { createChildDivElement } from "./dom";
import { EditMode, getCurrentEditMode } from "./edit-mode";
import { getHighlightedValue, setHighlightedValue } from "./highlight";
import {
  EMPTY_VALUE,
  sudokuValues,
  SudokuValue,
  isEmpty,
} from "./sudoku-value";

interface Position {
  readonly row: number;
  readonly col: number;
}

type CellMode = "Normal" | "Memo";

const defaultCellMode: CellMode = "Memo";

const BASE_SIZE = 3;

export const BOARD_SIZE = BASE_SIZE * BASE_SIZE;

const numberOfCells = BOARD_SIZE * BOARD_SIZE;

const cells: Array<Cell> = [];

class NeighborCells {
  readonly sameRow: Array<Cell>;
  readonly sameColumn: Array<Cell>;
  readonly sameBlock: Array<Cell>;

  public constructor(position: Position) {
    function getSameRowCells(): Array<Cell> {
      const neighborCells = new Array<Cell>();
      const row: number = position.row;
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (col === position.col) {
          continue;
        }
        neighborCells.push(cells[row * BOARD_SIZE + col]);
      }
      return neighborCells;
    }
    function getSameColumnCells(): Array<Cell> {
      const neighborCells = new Array<Cell>();
      const col: number = position.col;
      for (let row = 0; row < BOARD_SIZE; row++) {
        if (row === position.row) {
          continue;
        }
        neighborCells.push(cells[row * BOARD_SIZE + col]);
      }
      return neighborCells;
    }
    function getSameBlockCells(): Array<Cell> {
      const neighborCells = new Array<Cell>();
      const j: number = Math.floor(position.row / BASE_SIZE);
      const i: number = Math.floor(position.col / BASE_SIZE);
      for (let row = BASE_SIZE * j; row < BASE_SIZE * (j + 1); row++) {
        for (let col = BASE_SIZE * i; col < BASE_SIZE * (i + 1); col++) {
          if (position.row === row && position.col === col) {
            continue;
          }
          neighborCells.push(cells[row * BOARD_SIZE + col]);
        }
      }
      return neighborCells;
    }
    this.sameRow = getSameRowCells();
    this.sameColumn = getSameColumnCells();
    this.sameBlock = getSameBlockCells();
  }

  public flatten(): Array<Cell> {
    const cells = new Array<Cell>();
    for (const neighborCell of this.sameRow) {
      cells.push(neighborCell);
    }
    for (const neighborCell of this.sameColumn) {
      cells.push(neighborCell);
    }
    for (const neighborCell of this.sameBlock) {
      cells.push(neighborCell);
    }
    return cells;
  }
}

class Cell {
  private readonly _position: Position;
  private readonly _cellElement: HTMLDivElement;
  private readonly _cellTextElement: HTMLDivElement;
  // NOTE: includes a dummy element (0) for convenience, which is "display: none"
  private readonly _subCellElements: ReadonlyArray<HTMLDivElement>;
  private readonly _subCellValuesValid: Array<boolean> = new Array<boolean>(
    sudokuValues.length,
  ).fill(/* initially assume all candidates are valid */ true);
  private readonly _subCellValuesUnique: Array<boolean> = new Array<boolean>(
    sudokuValues.length,
  ).fill(false);
  private readonly _subCellValuesDisabled: Array<boolean> = new Array<boolean>(
    sudokuValues.length,
  ).fill(false);
  private _value: SudokuValue = EMPTY_VALUE;
  private _isDefault = false;
  private _isSelected = false;
  private _cellMode: CellMode = defaultCellMode;

  public constructor(containerElement: HTMLElement, position: Position) {
    // element to contain
    //   1. normal value
    //   2. nine memo values
    const cellElement: HTMLDivElement = createChildDivElement({
      parentElement: containerElement,
      classListItems: ["cell"],
      attributes: [
        { key: "cellMode", value: defaultCellMode },
        { key: "row", value: position.row.toString() },
        { key: "col", value: position.col.toString() },
        { key: "isHighlighted", value: false.toString() },
        { key: "isSelected", value: false.toString() },
      ],
    });
    cellElement.addEventListener("click", (event: Event) => {
      // disable body element click
      event.stopPropagation();
      // other cells should be unselected
      unselectBoard();
      // select this cell
      this.isSelected = true;
      // highlight cells and subcells which contain this value
      setHighlightedValue(this.value);
    });
    // element to keep normal value, which is vertically centered
    const cellTextElement: HTMLDivElement = createChildDivElement({
      parentElement: cellElement,
      classListItems: ["text"],
      attributes: [],
    });
    // elements to keep memo values
    const subCellElements = sudokuValues.map((sudokuValue: SudokuValue) => {
      const subCellElement: HTMLDivElement = createChildDivElement({
        parentElement: cellElement,
        classListItems: ["subcell"],
        attributes: [
          { key: "isHighlighted", value: false.toString() },
          { key: "isUnique", value: false.toString() },
          { key: "isDisabled", value: false.toString() },
        ],
      });
      const subCellTextElement: HTMLDivElement = createChildDivElement({
        parentElement: subCellElement,
        classListItems: ["text"],
        attributes: [],
      });
      subCellTextElement.textContent = sudokuValue.toString();
      if (EMPTY_VALUE === sudokuValue) {
        subCellElement.style.display = "none";
      }
      return subCellElement;
    });
    this._cellElement = cellElement;
    this._cellTextElement = cellTextElement;
    this._subCellElements = subCellElements;
    this._position = position;
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

  public getSubCellUniqueness(value: SudokuValue): boolean {
    return this._subCellValuesUnique[value];
  }

  public setSubCellUniqueness(value: SudokuValue, isUnique: boolean) {
    this._subCellValuesUnique[value] = isUnique;
    this._subCellElements[value].setAttribute("isUnique", isUnique.toString());
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
    for (const sudokuValue of sudokuValues) {
      this._subCellElements[sudokuValue].setAttribute(
        "isHighlighted",
        (sudokuValue === value).toString(),
      );
    }
  }

  public getNeighborCells(): NeighborCells {
    const position: Position = this.position;
    return new NeighborCells(position);
  }

  public validate(newValue: SudokuValue): boolean {
    const neighborCells: Array<Cell> = this.getNeighborCells().flatten();
    for (const neighborCell of neighborCells) {
      if (neighborCell.value === newValue) {
        return false;
      }
    }
    return true;
  }

  public resetDisabledMemoValues() {
    for (const sudokuValue of sudokuValues) {
      this.setSubCellDisability(sudokuValue, false);
    }
  }

  public validateAndUpdateMemoValues() {
    // for each value, check if it is a valid candidate
    //   (by checking neighbor cells)
    //   and update the flag
    for (const sudokuValue of sudokuValues) {
      this.setSubCellValidity(sudokuValue, this.validate(sudokuValue));
    }
  }

  private isOnlyCandidate(value: SudokuValue): boolean {
    for (const sudokuValue of sudokuValues) {
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

  public updateUniquenessOfMemoValues() {
    if (this.cellMode !== "Memo") {
      return;
    }
    for (const sudokuValue of sudokuValues) {
      // reset uniqueness to be false (default)
      this.setSubCellUniqueness(sudokuValue, false);
      if (sudokuValue === EMPTY_VALUE) {
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
      // check uniqueness with respect to neighbor cells
      const isUnshared = (neighborCell: Cell): boolean => {
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
      };
      const neighborCells: NeighborCells = this.getNeighborCells();
      if (
        neighborCells.sameRow.every(isUnshared) ||
        neighborCells.sameColumn.every(isUnshared) ||
        neighborCells.sameBlock.every(isUnshared)
      ) {
        this.setSubCellUniqueness(sudokuValue, true);
      }
    }
  }
}

export function initializeBoard(
  containerElement: HTMLDivElement,
  puzzle: ReadonlyArray<ReadonlyArray<SudokuValue>>,
) {
  for (let n = 0; n < numberOfCells; n++) {
    const position: Position = {
      row: Math.floor(n / BOARD_SIZE),
      col: n % BOARD_SIZE,
    };
    cells.push(new Cell(containerElement, position));
  }
  for (const cell of cells) {
    const value: SudokuValue = puzzle[cell.position.row][cell.position.col];
    if (isEmpty(value)) {
      cell.cellMode = "Memo";
    } else {
      cell.cellMode = "Normal";
      cell.isDefault = true;
      cell.value = value;
    }
  }
  // based on the current normal cell values,
  // update all memo cells to display all possible values
  for (const cell of cells) {
    cell.validateAndUpdateMemoValues();
  }
  for (const cell of cells) {
    cell.updateUniquenessOfMemoValues();
  }
}

export function highlightBoard() {
  const highlightedValue: SudokuValue = getHighlightedValue();
  for (const cell of cells) {
    switch (cell.cellMode) {
      case "Normal": {
        const value: SudokuValue = cell.value;
        cell.isHighlighted = !isEmpty(value) && highlightedValue === value;
        break;
      }
      case "Memo": {
        cell.isHighlighted = false;
        cell.highlightSubCell(highlightedValue);
        break;
      }
    }
  }
}

export function validateAndUpdateValue(value: SudokuValue) {
  // check if a cell is selected in the first place
  const selectedCell: Cell | null = (function getSelectedCell() {
    for (const cell of cells) {
      if (cell.isSelected) {
        return cell;
      }
    }
    return null;
  })();
  if (selectedCell === null) {
    return;
  }
  // if we are in the "Init" mode now, all changes are allowed
  // otherwise input should be validated
  const currentEditMode: EditMode = getCurrentEditMode();
  if ("Init" !== currentEditMode) {
    if (selectedCell.isDefault) {
      // cannot override default cell, unless the cell is in "edit" mode
      return;
    }
    if (!isEmpty(value)) {
      // trying to assign a non-empty value
      // need to check if the new value does not violate the sudoku rule
      if (!selectedCell.validate(value)) {
        return;
      }
    }
  }
  // the assigned value will be fronzen for "Init" mode
  if ("Init" === currentEditMode) {
    selectedCell.isDefault = true;
  } else {
    selectedCell.isDefault = false;
  }
  // update value
  switch (currentEditMode) {
    case "Init":
    case "Normal": {
      if (currentEditMode === "Init") {
        for (const cell of cells) {
          for (const sudokuValue of sudokuValues) {
            cell.setSubCellDisability(sudokuValue, false);
          }
        }
      }
      const neighborCells: Array<Cell> = selectedCell
        .getNeighborCells()
        .flatten();
      if (isEmpty(value)) {
        // erase value and turn it to a memo cell
        selectedCell.cellMode = "Memo";
        selectedCell.isDefault = false;
        const originalValue: SudokuValue = selectedCell.value;
        selectedCell.value = EMPTY_VALUE;
        // revive the original value in the related (same row, column, block) memo cells
        for (const neighborCell of neighborCells) {
          const isValid: boolean = neighborCell.validate(originalValue);
          neighborCell.setSubCellValidity(originalValue, isValid);
        }
      } else {
        // turn it to a normal cell
        selectedCell.cellMode = "Normal";
        // update normal value
        selectedCell.value = value;
        // filter this value in the memo cells
        //   which are related (same row, column, block)
        for (const neighborCell of neighborCells) {
          const isValid = false;
          neighborCell.setSubCellValidity(value, isValid);
        }
      }
      break;
    }
    case "Memo": {
      selectedCell.cellMode = "Memo";
      selectedCell.value = EMPTY_VALUE;
      if (isEmpty(value)) {
        // reset memo to default
        selectedCell.resetDisabledMemoValues();
      } else {
        // toggle corresponding memo value
        const isDisabled: boolean = selectedCell.getSubCellDisability(value);
        selectedCell.setSubCellDisability(value, !isDisabled);
      }
      break;
    }
  }
  for (const cell of cells) {
    cell.validateAndUpdateMemoValues();
  }
  for (const cell of cells) {
    cell.updateUniquenessOfMemoValues();
  }
}

export function unselectBoard() {
  for (const cell of cells) {
    cell.isSelected = false;
  }
}
