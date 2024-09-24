import { createChildDivElement } from "./dom";
import { initializeEditMode } from "./edit-mode";
import { initializeBoard, unselectBoard } from "./board";
import { initializeNumberButtons } from "./number-button";
import { initializeKeyboardEvents } from "./keyboard";
import { setHighlightedValue } from "./highlight";
import { EMPTY_VALUE } from "./sudoku-value";

document.body.addEventListener("click", () => {
  unselectBoard();
  setHighlightedValue(EMPTY_VALUE);
});

window.addEventListener("load", () => {
  // create containers
  const bodyElement: HTMLElement = document.body;
  const editModeButtonContainer: HTMLDivElement = createChildDivElement({
    parentElement: bodyElement,
    classListItems: ["mode-buttons"],
    attributes: [],
  });
  const board: HTMLDivElement = createChildDivElement({
    parentElement: bodyElement,
    classListItems: ["board"],
    attributes: [],
  });
  const numberButtonContainer: HTMLDivElement = createChildDivElement({
    parentElement: bodyElement,
    classListItems: ["number-buttons"],
    attributes: [],
  });
  // initialize child elements
  initializeEditMode(editModeButtonContainer);
  initializeBoard(board, [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 7, 6, 0, 4, 0],
    [0, 0, 0, 0, 2, 0, 1, 0, 3],
    [0, 0, 0, 0, 0, 9, 0, 6, 0],
    [0, 0, 3, 0, 0, 0, 0, 0, 1],
    [9, 5, 0, 0, 6, 4, 0, 3, 7],
    [0, 1, 0, 0, 0, 0, 0, 7, 5],
    [6, 0, 8, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 2, 0, 0, 0],
  ]);
  initializeNumberButtons(numberButtonContainer);
  // map keyboard to corresponding events
  initializeKeyboardEvents();
});
