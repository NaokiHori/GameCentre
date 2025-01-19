export class Body {
  private readonly _element: HTMLElement;

  public constructor() {
    const element: HTMLElement = document.body;
    this._element = element;
  }

  public get element(): HTMLElement {
    return this._element;
  }

  public setOnClickHandler(handler: () => void) {
    this._element.addEventListener("click", handler);
  }
}
