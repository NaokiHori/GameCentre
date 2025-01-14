export type Equation = (x: number) => number;

export interface Equations {
  red: Equation;
  green: Equation;
  blue: Equation;
}
