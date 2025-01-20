import { Canvas } from "./canvas";
import { Maze } from "./maze";
import { ArrowButton } from "./arrowButton";

function drawMakingProcess(canvas: Canvas, maze: Maze) {
  maze.proceedMakingProcess();
  maze.draw(canvas.ctx, [canvas.width, canvas.height]);
  if (!maze.isMakingCompleted()) {
    requestAnimationFrame(() => {
      drawMakingProcess(canvas, maze);
    });
  }
}

function handleWindowKeyDown(
  keyboardEvent: KeyboardEvent,
  canvas: Canvas,
  maze: Maze,
) {
  switch (keyboardEvent.key) {
    case "ArrowUp":
    case "k":
    case "w":
      maze.moveCursor("DOWN");
      break;
    case "ArrowDown":
    case "j":
    case "s":
      maze.moveCursor("UP");
      break;
    case "ArrowLeft":
    case "h":
    case "a":
      maze.moveCursor("LEFT");
      break;
    case "ArrowRight":
    case "l":
    case "d":
      maze.moveCursor("RIGHT");
      break;
    default:
      break;
  }
  maze.draw(canvas.ctx, [canvas.width, canvas.height]);
}

function setupArrowButtons(canvas: Canvas, maze: Maze) {
  const arrowButtons = {
    left: new ArrowButton("arrow-left"),
    right: new ArrowButton("arrow-right"),
    down: new ArrowButton("arrow-down"),
    up: new ArrowButton("arrow-up"),
  };
  arrowButtons.left.setOnClickHandler(() => {
    maze.moveCursor("LEFT");
    maze.draw(canvas.ctx, [canvas.width, canvas.height]);
  });
  arrowButtons.right.setOnClickHandler(() => {
    maze.moveCursor("RIGHT");
    maze.draw(canvas.ctx, [canvas.width, canvas.height]);
  });
  arrowButtons.down.setOnClickHandler(() => {
    maze.moveCursor("UP");
    maze.draw(canvas.ctx, [canvas.width, canvas.height]);
  });
  arrowButtons.up.setOnClickHandler(() => {
    maze.moveCursor("DOWN");
    maze.draw(canvas.ctx, [canvas.width, canvas.height]);
  });
}

function main() {
  const canvas = new Canvas();
  const maze = (function () {
    const roughNumberOfGrids = 1 << 10;
    const canvasAspectRatio = canvas.width / canvas.height;
    const height = Math.sqrt(roughNumberOfGrids / canvasAspectRatio);
    const width = height * canvasAspectRatio;
    return new Maze({ width, height });
  })();
  window.addEventListener("keydown", (keyboardEvent: KeyboardEvent) => {
    handleWindowKeyDown(keyboardEvent, canvas, maze);
  });
  setupArrowButtons(canvas, maze);
  drawMakingProcess(canvas, maze);
}

window.addEventListener("load", () => {
  main();
});
