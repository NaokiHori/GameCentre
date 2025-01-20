export class ArrowButton {
  private _element: HTMLButtonElement;

  public constructor(elementId: string) {
    const element: HTMLElement | null = document.getElementById(elementId);
    if (null === element) {
      throw new Error(`Failed to find an element: ${elementId}`);
    }
    this._element = element as HTMLButtonElement;
  }

  public setOnClickHandler(handler: () => void) {
    this._element.addEventListener("click", () => { handler(); });
  }
}
