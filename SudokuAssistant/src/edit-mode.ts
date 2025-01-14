import { createChildButtonElement } from "./dom";

const editModeButtons: Array<EditModeButton> = [];

export type EditMode = "Init" | "Normal" | "Memo";

class EditModeButton {
  private readonly _element: HTMLButtonElement;
  private readonly _editMode: EditMode;
  private _isSelected: boolean;

  private updateSelectedAttribute(isSelected: boolean) {
    this._element.setAttribute("selected", isSelected.toString());
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

  public constructor(
    containerElement: HTMLDivElement,
    editMode: EditMode,
    isSelected: boolean,
  ) {
    const buttonElement: HTMLButtonElement = createChildButtonElement({
      parentElement: containerElement,
      classListItems: ["mode-button"],
      attributes: [],
    });
    buttonElement.textContent = editMode;
    buttonElement.addEventListener("click", (event: Event) => {
      event.stopPropagation();
      changeEditMode(this.editMode);
    });
    this._element = buttonElement;
    this._isSelected = isSelected;
    this._editMode = editMode;
    this.updateSelectedAttribute(isSelected);
  }
}

export function initializeEditMode(containerElement: HTMLDivElement) {
  editModeButtons.push(new EditModeButton(containerElement, "Init", false));
  editModeButtons.push(new EditModeButton(containerElement, "Normal", true));
  editModeButtons.push(new EditModeButton(containerElement, "Memo", false));
}

export function getCurrentEditMode(): EditMode {
  for (const editModeButton of editModeButtons) {
    if (editModeButton.isSelected) {
      return editModeButton.editMode;
    }
  }
  throw new Error("no modes are selected");
}

export function changeEditMode(editMode: EditMode) {
  editModeButtons.forEach((editModeButton: EditModeButton) => {
    editModeButton.isSelected = editModeButton.editMode === editMode;
  });
}
