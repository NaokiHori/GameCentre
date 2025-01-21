export type Cell = "WALL" | "ROAD" | "DEADEND";
export type Direction = "DOWN" | "UP" | "LEFT" | "RIGHT";

export interface BoardSize {
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}
