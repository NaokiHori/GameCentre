import { Equation } from "./equation";

export interface Formula {
  label: string;
  equation: Equation;
}

// ref: Gnuplot, "show palette rgbformulae"
export const FORMULAE: Formula[] = [
  {
    label: "0",
    equation: () => 0,
  },
  {
    label: "0.5",
    equation: () => 0.5,
  },
  {
    label: "1",
    equation: () => 1,
  },
  {
    label: "x",
    equation: (x: number) => x,
  },
  {
    label: "x^2",
    equation: (x: number) => Math.pow(x, 2),
  },
  {
    label: "x^3",
    equation: (x: number) => Math.pow(x, 3),
  },
  {
    label: "x^4",
    equation: (x: number) => Math.pow(x, 4),
  },
  {
    label: "sqrt(x)",
    equation: (x: number) => Math.sqrt(x),
  },
  {
    label: "sqrt(sqrt(x))",
    equation: (x: number) => Math.sqrt(Math.sqrt(x)),
  },
  {
    label: "sin(90x)",
    equation: (x: number) => Math.sin(0.5 * Math.PI * x),
  },
  {
    label: "cos(90x)",
    equation: (x: number) => Math.cos(0.5 * Math.PI * x),
  },
  {
    label: "|x - 0.5|",
    equation: (x: number) => Math.abs(x - 0.5),
  },
  {
    label: "(2x-1)^2",
    equation: (x: number) => Math.pow(2 * x - 1, 2),
  },
  {
    label: "sin(180x)",
    equation: (x: number) => Math.sin(Math.PI * x),
  },
  {
    label: "|cos(180x)|",
    equation: (x: number) => Math.abs(Math.cos(Math.PI * x)),
  },
  {
    label: "sin(360x)",
    equation: (x: number) => Math.sin(2 * Math.PI * x),
  },
  {
    label: "cos(360x)",
    equation: (x: number) => Math.cos(2 * Math.PI * x),
  },
  {
    label: "|sin(360x)|",
    equation: (x: number) => Math.abs(Math.sin(2 * Math.PI * x)),
  },
  {
    label: "|cos(360x)|",
    equation: (x: number) => Math.abs(Math.cos(2 * Math.PI * x)),
  },
  {
    label: "|sin(720x)|",
    equation: (x: number) => Math.abs(Math.sin(4 * Math.PI * x)),
  },
  {
    label: "|cos(720x)|",
    equation: (x: number) => Math.abs(Math.cos(4 * Math.PI * x)),
  },
  {
    label: "3x",
    equation: (x: number) => 3 * x,
  },
  {
    label: "3x-1",
    equation: (x: number) => 3 * x - 1,
  },
  {
    label: "3x-2",
    equation: (x: number) => 3 * x - 2,
  },
  {
    label: "|3x-1|",
    equation: (x: number) => Math.abs(3 * x - 1),
  },
  {
    label: "|3x-2|",
    equation: (x: number) => Math.abs(3 * x - 2),
  },
  {
    label: "(3x-1)/2",
    equation: (x: number) => (3 * x - 1) / 2,
  },
  {
    label: "(3x-2)/2",
    equation: (x: number) => (3 * x - 2) / 2,
  },
  {
    label: "|(3x-1)/2|",
    equation: (x: number) => Math.abs((3 * x - 1) / 2),
  },
  {
    label: "|(3x-2)/2|",
    equation: (x: number) => Math.abs((3 * x - 2) / 2),
  },
  {
    label: "x/0.32-0.78125",
    equation: (x: number) => x / 0.32 - 0.78125,
  },
  {
    label: "2*x-0.84",
    equation: (x: number) => 2 * x - 0.84,
  },
  {
    label: "4x;1;-2x+1.84;x/0.08-11.5",
    equation: (x: number) => {
      if (x < 0.25) {
        return 4 * x;
      } else if (x < 0.42) {
        return 1;
      } else if (x < 0.92) {
        return 1.84 - 2 * x;
      } else {
        return x / 0.08 - 11.5;
      }
    },
  },
  {
    label: "|2*x - 0.5|",
    equation: (x: number) => Math.abs(2 * x - 0.5),
  },
  {
    label: "2*x",
    equation: (x: number) => 2 * x,
  },
  {
    label: "2*x - 0.5",
    equation: (x: number) => 2 * x - 0.5,
  },
  {
    label: "2*x - 1",
    equation: (x: number) => 2 * x - 1,
  },
];
