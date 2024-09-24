import { createChildButtonElement } from "./dom";
import { getHighlightedValue, setHighlightedValue } from "./highlight";
import { SudokuValue, isEmpty, sudokuValues } from "./sudoku-value";
import { validateAndUpdateValue } from "./board";

const numberButtons: Array<NumberButton> = [];

class NumberButton {
  private readonly _element: HTMLButtonElement;
  private _value: SudokuValue;

  public constructor(containerElement: HTMLDivElement, value: SudokuValue) {
    const buttonElement: HTMLButtonElement = createChildButtonElement({
      parentElement: containerElement,
      classListItems: ["number-button"],
      attributes: [],
    });
    buttonElement.textContent = isEmpty(value) ? "" : value.toString();
    buttonElement.addEventListener("click", (event: Event) => {
      event.stopPropagation();
      validateAndUpdateValue(value);
      setHighlightedValue(value);
    });
    this._element = buttonElement;
    this._value = value;
    this.isHighlighted = false;
  }

  public get value(): SudokuValue {
    return this._value;
  }

  public set isHighlighted(isHighlighted: boolean) {
    this._element.setAttribute("highlighted", isHighlighted.toString());
  }

  public click() {
    this._element.click();
  }
}

export function initializeNumberButtons(containerElement: HTMLDivElement) {
  for (const sudokuValue of sudokuValues) {
    numberButtons.push(new NumberButton(containerElement, sudokuValue));
  }
}

export function highlightButton() {
  const highlightedValue: SudokuValue = getHighlightedValue();
  for (const numberButton of numberButtons) {
    numberButton.isHighlighted =
      !isEmpty(highlightedValue) && numberButton.value === highlightedValue;
  }
}

export function clickButton(value: SudokuValue) {
  for (const numberButton of numberButtons) {
    if (numberButton.value === value) {
      numberButton.click();
      break;
    }
  }
}
