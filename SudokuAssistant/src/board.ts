import { createChildElement } from "./dom";
import { Body } from "./body";
import { EditMode, EditModes } from "./editMode";
import {
  EMPTY_VALUE,
  SUDOKU_VALUES,
  SudokuValue,
  isEmpty,
} from "./sudokuValue";
import { Cell } from "./board/cell";
import { BOARD_SIZE } from "./board/param";
import { Position } from "./board/position";
import { setNeighborCells } from "./board/setNeighborCells";

export class Board {
  private _cells: Array<Cell>;

  public constructor(
    body: Body,
    puzzle: ReadonlyArray<ReadonlyArray<SudokuValue>>,
  ) {
    const element = createChildElement({
      tagName: "div",
      parentElement: body.element,
      classListItems: ["board"],
      attributes: [],
    }) as HTMLDivElement;
    const cells = new Array<Cell>();
    for (let n = 0; n < BOARD_SIZE * BOARD_SIZE; n++) {
      const position: Position = {
        row: Math.floor(n / BOARD_SIZE),
        column: n % BOARD_SIZE,
      };
      cells.push(new Cell(element, position));
    }
    for (const cell of cells) {
      const row = cell.position.row;
      const column = cell.position.column;
      const value: SudokuValue = puzzle[row][column];
      if (isEmpty(value)) {
        cell.cellMode = "Memo";
      } else {
        cell.cellMode = "Normal";
        cell.isDefault = true;
        cell.value = value;
      }
    }
    for (const cell of cells) {
      setNeighborCells(cell, cells);
    }
    // based on the current normal cell values,
    //   update all memo cells
    //   to display all possible values
    for (const cell of cells) {
      cell.validateAndUpdateMemoValues();
    }
    for (const cell of cells) {
      cell.updateUniquenessOfMemoValues();
    }
    this._cells = cells;
  }

  public setOnClickHandler(handler: (cellValue: SudokuValue) => void) {
    const cells: Array<Cell> = this._cells;
    for (const cell of cells) {
      cell.setOnClickHandler(handler);
    }
  }

  public highlight(highlightedValue: SudokuValue) {
    const cells: Array<Cell> = this._cells;
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

  public validateAndUpdateValue(editModes: EditModes, value: SudokuValue) {
    const cells = this._cells;
    // check if a cell is selected in the first place
    const selectedCell: Cell | null = getSelectedCell(cells);
    if (selectedCell === null) {
      return;
    }
    // if we are in the "Init" mode now, all changes are allowed
    // otherwise input should be validated
    const currentEditMode: EditMode = editModes.currentMode;
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
    if ("Memo" === currentEditMode) {
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
    } else {
      if (currentEditMode === "Init") {
        for (const cell of cells) {
          for (const sudokuValue of SUDOKU_VALUES) {
            cell.setSubCellDisability(sudokuValue, false);
          }
        }
      }
      const neighborCells: {
        sameRow: Array<Cell>;
        sameColumn: Array<Cell>;
        sameBlock: Array<Cell>;
      } = selectedCell.neighborCells;
      if (isEmpty(value)) {
        // erase value and turn it to a memo cell
        selectedCell.cellMode = "Memo";
        selectedCell.isDefault = false;
        const originalValue: SudokuValue = selectedCell.value;
        selectedCell.value = EMPTY_VALUE;
        // revive the original value in the related (same row, column, block) memo cells
        for (const neighborCell of [
          ...neighborCells.sameRow,
          ...neighborCells.sameColumn,
          ...neighborCells.sameBlock,
        ]) {
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
        for (const neighborCell of [
          ...neighborCells.sameRow,
          ...neighborCells.sameColumn,
          ...neighborCells.sameBlock,
        ]) {
          const isValid = false;
          neighborCell.setSubCellValidity(value, isValid);
        }
      }
    }
    for (const cell of cells) {
      cell.validateAndUpdateMemoValues();
    }
    for (const cell of cells) {
      cell.updateUniquenessOfMemoValues();
    }
  }

  public updateSelectedCell(direction: "Down" | "Up" | "Left" | "Right") {
    const cells = this._cells;
    const currentSelectedCell: Cell | null = getSelectedCell(cells);
    if (currentSelectedCell === null) {
      return;
    }
    currentSelectedCell.isSelected = false;
    const nextSelectedCell: Cell = (function (): Cell {
      const { row, column } = currentSelectedCell.position;
      const newRow: number = (function (): number {
        if (direction === "Up") {
          return (row - 1 + BOARD_SIZE) % BOARD_SIZE;
        } else if (direction === "Down") {
          return (row + 1) % BOARD_SIZE;
        } else {
          return row;
        }
      })();
      const newColumn: number = (function (): number {
        if (direction === "Left") {
          return (column - 1 + BOARD_SIZE) % BOARD_SIZE;
        } else if (direction === "Right") {
          return (column + 1) % BOARD_SIZE;
        } else {
          return column;
        }
      })();
      return cells[newRow * BOARD_SIZE + newColumn];
    })();
    nextSelectedCell.isSelected = true;
  }

  public unselect() {
    const cells = this._cells;
    for (const cell of cells) {
      cell.isSelected = false;
    }
  }

  public reset() {
    this.unselect();
    const cells = this._cells;
    for (const cell of cells) {
      cell.reset();
    }
  }
}

function getSelectedCell(cells: Array<Cell>): Cell | null {
  for (const cell of cells) {
    if (cell.isSelected) {
      return cell;
    }
  }
  return null;
}
