import { Body } from "./body";
import { createChildElement } from "./dom";

export type EditMode = "Init" | "Normal" | "Memo";

class EditModeButton {
  private readonly _element: HTMLButtonElement;
  private readonly _editMode: EditMode;
  private _isSelected: boolean;

  public constructor(
    containerElement: HTMLDivElement,
    editMode: EditMode,
    isSelected: boolean,
  ) {
    const element = createChildElement({
      tagName: "button",
      parentElement: containerElement,
      classListItems: ["mode-button"],
      attributes: [],
    }) as HTMLButtonElement;
    element.textContent = editMode;
    this._element = element;
    this._editMode = editMode;
    this._isSelected = isSelected;
    this.updateSelectedAttribute(isSelected);
  }

  public setClickEventHandler(handler: () => void) {
    this._element.addEventListener("click", (event: Event) => {
      event.stopPropagation();
      handler();
    });
  }

  public get editMode(): EditMode {
    return this._editMode;
  }

  public get isSelected(): boolean {
    return this._isSelected;
  }

  public set isSelected(isSelected: boolean) {
    this._isSelected = isSelected;
    this.updateSelectedAttribute(isSelected);
  }

  private updateSelectedAttribute(isSelected: boolean) {
    this._element.setAttribute("selected", isSelected.toString());
  }
}

export class EditModes {
  private readonly _editModeButtons: Array<EditModeButton>;

  public constructor(body: Body) {
    const containerElement = createChildElement({
      tagName: "div",
      parentElement: body.element,
      classListItems: ["mode-buttons"],
      attributes: [],
    }) as HTMLDivElement;
    const editModeButtons = new Array<EditModeButton>();
    editModeButtons.push(new EditModeButton(containerElement, "Init", false));
    editModeButtons.push(new EditModeButton(containerElement, "Normal", true));
    editModeButtons.push(new EditModeButton(containerElement, "Memo", false));
    editModeButtons.forEach((editModeButton: EditModeButton) => {
      editModeButton.setClickEventHandler(() => {
        this.changeTo(editModeButton.editMode);
      });
    });
    this._editModeButtons = editModeButtons;
  }

  public get currentMode(): EditMode {
    const editModeButtons = this._editModeButtons;
    for (const editModeButton of editModeButtons) {
      if (editModeButton.isSelected) {
        return editModeButton.editMode;
      }
    }
    throw new Error("No mode is selected");
  }

  public changeTo(editMode: EditMode) {
    const editModeButtons = this._editModeButtons;
    editModeButtons.forEach((editModeButton: EditModeButton) => {
      editModeButton.isSelected = editModeButton.editMode === editMode;
    });
  }
}
