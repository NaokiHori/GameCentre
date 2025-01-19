import { createChildElement } from "./dom";
import { Body } from "./body";
import { SudokuValue, isEmpty, SUDOKU_VALUES } from "./sudokuValue";

class NumberButton {
  private readonly _element: HTMLButtonElement;
  private _value: SudokuValue;

  public constructor(containerElement: HTMLDivElement, value: SudokuValue) {
    const buttonElement = createChildElement({
      tagName: "button",
      parentElement: containerElement,
      classListItems: ["number-button"],
      attributes: [],
    }) as HTMLButtonElement;
    buttonElement.textContent = isEmpty(value) ? "" : value.toString();
    this._element = buttonElement;
    this._value = value;
    this.isHighlighted = false;
  }

  public setOnClickHandler(handler: () => void) {
    this._element.addEventListener("click", (event: Event) => {
      event.stopPropagation();
      handler();
    });
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

export class NumberButtons {
  private _numberButtons: Array<NumberButton>;

  public constructor(body: Body) {
    const containerElement = createChildElement({
      tagName: "div",
      parentElement: body.element,
      classListItems: ["number-buttons"],
      attributes: [],
    }) as HTMLDivElement;
    const numberButtons = new Array<NumberButton>();
    for (const sudokuValue of SUDOKU_VALUES) {
      numberButtons.push(new NumberButton(containerElement, sudokuValue));
    }
    this._numberButtons = numberButtons;
  }

  public setOnClickHandler(handler: (clickedButtonValue: SudokuValue) => void) {
    const numberButtons: Array<NumberButton> = this._numberButtons;
    numberButtons.forEach((numberButton: NumberButton) => {
      numberButton.setOnClickHandler(() => {
        const value: SudokuValue = numberButton.value;
        handler(value);
      });
    });
  }

  public highlight(highlightedValue: SudokuValue) {
    const numberButtons: Array<NumberButton> = this._numberButtons;
    for (const numberButton of numberButtons) {
      if (isEmpty(highlightedValue)) {
        numberButton.isHighlighted = false;
      } else if (numberButton.value !== highlightedValue) {
        numberButton.isHighlighted = false;
      } else {
        numberButton.isHighlighted = true;
      }
    }
  }

  public select(value: SudokuValue) {
    const numberButtons: Array<NumberButton> = this._numberButtons;
    for (const numberButton of numberButtons) {
      if (numberButton.value === value) {
        numberButton.click();
        break;
      }
    }
  }
}
