import { Canvas } from "./canvas";
import { Maze } from "./maze";
import { Button } from "./button";

function continueMazeGeneration(
  canvas: Canvas,
  maze: Maze,
  solveButton: Button,
) {
  const { isCompleted } = maze.make();
  maze.draw(canvas.ctx, [canvas.width, canvas.height]);
  if (!isCompleted) {
    requestAnimationFrame(() => {
      continueMazeGeneration(canvas, maze, solveButton);
    });
  } else {
    solveButton.enable();
  }
}

function continueMazeSolving(canvas: Canvas, maze: Maze) {
  const { isCompleted } = maze.solve();
  maze.draw(canvas.ctx, [canvas.width, canvas.height]);
  if (!isCompleted) {
    requestAnimationFrame(() => {
      continueMazeSolving(canvas, maze);
    });
  }
}

function handleKeyDown(
  keyboardEvent: KeyboardEvent,
  canvas: Canvas,
  maze: Maze,
) {
  switch (keyboardEvent.key) {
    case "ArrowUp":
      maze.moveCursor("DOWN");
      break;
    case "ArrowDown":
      maze.moveCursor("UP");
      break;
    case "ArrowLeft":
      maze.moveCursor("LEFT");
      break;
    case "ArrowRight":
      maze.moveCursor("RIGHT");
      break;
    default:
      break;
  }
  maze.draw(canvas.ctx, [canvas.width, canvas.height]);
}

function main() {
  const canvas = new Canvas();
  const maze = (function (): Maze {
    const roughNumberOfGrids = 1 << 12;
    const canvasAspectRatio = canvas.width / canvas.height;
    const height = Math.sqrt(roughNumberOfGrids / canvasAspectRatio);
    const width = height * canvasAspectRatio;
    return new Maze({ width, height });
  })();
  window.addEventListener("keydown", (keyboardEvent: KeyboardEvent) => {
    handleKeyDown(keyboardEvent, canvas, maze);
  });
  const solveButton = new Button("solve-button");
  solveButton.setOnClickHandler(() => {
    solveButton.disable();
    continueMazeSolving(canvas, maze);
  });
  continueMazeGeneration(canvas, maze, solveButton);
}

window.addEventListener("load", () => {
  main();
});
