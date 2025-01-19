import { Cell } from "./cell";
import { Position } from "./position";
import { BOARD_SIZE, BASE_SIZE } from "./param";

export function setNeighborCells(cell: Cell, cells: Array<Cell>) {
  const position: Position = cell.position;
  cell.neighborCells = {
    sameRow: getSameRowCells(position, cells),
    sameColumn: getSameColumnCells(position, cells),
    sameBlock: getSameBlockCells(position, cells),
  };
}

function getSameRowCells(position: Position, cells: Array<Cell>): Array<Cell> {
  const neighborCells = new Array<Cell>();
  const row: number = position.row;
  for (let column = 0; column < BOARD_SIZE; column++) {
    if (column === position.column) {
      continue;
    }
    neighborCells.push(cells[row * BOARD_SIZE + column]);
  }
  return neighborCells;
}

function getSameColumnCells(
  position: Position,
  cells: Array<Cell>,
): Array<Cell> {
  const neighborCells = new Array<Cell>();
  const column: number = position.column;
  for (let row = 0; row < BOARD_SIZE; row++) {
    if (row === position.row) {
      continue;
    }
    neighborCells.push(cells[row * BOARD_SIZE + column]);
  }
  return neighborCells;
}

function getSameBlockCells(
  position: Position,
  cells: Array<Cell>,
): Array<Cell> {
  const neighborCells = new Array<Cell>();
  const blockRow: number = Math.floor(position.row / BASE_SIZE);
  const blockColumn: number = Math.floor(position.column / BASE_SIZE);
  for (
    let row = BASE_SIZE * blockRow;
    row < BASE_SIZE * (blockRow + 1);
    row++
  ) {
    for (
      let column = BASE_SIZE * blockColumn;
      column < BASE_SIZE * (blockColumn + 1);
      column++
    ) {
      if (position.row === row && position.column === column) {
        continue;
      }
      neighborCells.push(cells[row * BOARD_SIZE + column]);
    }
  }
  return neighborCells;
}
