import { Formula, FORMULAE } from "./formula";

export class ColorSelector {
  private _selectElement: HTMLSelectElement;
  private _selectedFormula: Formula;

  public constructor(container: HTMLDivElement, color: string) {
    // a container div element contains label and select elements
    const div = document.createElement("div");
    const label = document.createElement("label");
    const select = document.createElement("select");
    container.appendChild(div);
    div.appendChild(label);
    div.appendChild(select);
    div.classList.add("color-selector");
    label.textContent = capitalizeFirstLetter(color);
    label.setAttribute("for", `${color}-select`);
    label.setAttribute("style", `color: ${color};`);
    select.setAttribute("name", `${color}-options`);
    // choose one of formulae randomly and set
    const selectedIndex = Math.floor(FORMULAE.length * Math.random());
    this._selectedFormula = FORMULAE[selectedIndex];
    for (const [index, formula] of FORMULAE.entries()) {
      const option = document.createElement("option");
      option.setAttribute("value", index.toString());
      if (index === selectedIndex) {
        option.setAttribute("selected", "");
      }
      option.textContent = formula.label;
      select.appendChild(option);
    }
    select.addEventListener("change", (event: Event) => {
      const target = event.target as HTMLSelectElement;
      const index = Number(target.value);
      this._selectedFormula = FORMULAE[index];
    });
    this._selectElement = select;
  }

  public get equation(): (value: number) => number {
    return (value: number) => {
      const y = this._selectedFormula.equation(value);
      if (y < 0) {
        return 0;
      }
      if (1 < y) {
        return 1;
      }
      return y;
    };
  }

  public setChangeHandler(onChange: () => void) {
    this._selectElement.addEventListener("change", onChange);
  }
}

function capitalizeFirstLetter(sequence: string): string {
  const firstLetter = String(sequence).charAt(0);
  const otherLetters = String(sequence).slice(1);
  return firstLetter.toUpperCase() + otherLetters;
}
