export class Button {
  private _element: HTMLButtonElement;

  public constructor(elementId: string) {
    const element: HTMLElement | null = document.getElementById(elementId);
    if (null === element) {
      throw new Error(`Failed to find an element: ${elementId}`);
    }
    this._element = element as HTMLButtonElement;
    this.disable();
  }

  public setOnClickHandler(handler: () => void) {
    this._element.addEventListener("click", () => {
      handler();
    });
  }

  public enable() {
    this._element.disabled = false;
  }

  public disable() {
    this._element.disabled = true;
  }
}
