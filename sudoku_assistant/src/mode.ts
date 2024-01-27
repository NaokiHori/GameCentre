import { MyError } from "./myerror.js";
import { Wrapper } from "./wrapper.js";

const IndexName: string = `modes`;
export const ClassName: string = `mode`;

export enum ModeType {
  Edit   = `Edit`,
  Normal = `Normal`,
  Memo   = `Memo`,
}

const modes: ModeType[] = [
  ModeType.Edit,
  ModeType.Normal,
  ModeType.Memo,
];

const attr_current: string = `current`;

export class Mode {

  static initialise(): void {
    const container: HTMLElement = get_container();
    // create element for each mode
    for (const mode of modes) {
      const elem: HTMLElement = Wrapper.create_and_append_div(container);
      elem.id = modetype_to_id(mode);
      elem.textContent = mode;
      elem.classList.add(ClassName);
      Wrapper.set_flag(elem, attr_current, false);
    }
    // normal is the default mode
    Mode.change(ModeType.Normal);
  }

  static get_current_mode(): ModeType {
    // find current mode by attribute
    const query: string = `div[${attr_current}="${true}"]`;
    const elem: HTMLElement = Wrapper.querySelector(get_container(), query);
    const mode: string = Wrapper.get_textContent(elem);
    // compare to sanitise
    switch (mode) {
      case (ModeType.Edit  ).toString():
      case (ModeType.Normal).toString():
      case (ModeType.Memo  ).toString():
        return mode as ModeType;
      default:
        throw new Error(`${MyError.UnknownEnum}: ${mode}`);
    }
  }

  static change(target_mode: HTMLElement): void;
  static change(target_mode: ModeType): void;
  static change(target_mode: HTMLElement | ModeType): void {
    // search by id
    const target_id: string =
      target_mode instanceof HTMLElement
        ? target_mode.id
        : modetype_to_id(target_mode);
    // visit all elements classified by ClassName, set flag
    const query: string = `div.${ClassName}`;
    for (const elem of Wrapper.querySelectorAll(get_container(), modes.length, query)) {
      Wrapper.set_flag(elem, attr_current, elem.id === target_id);
    }
  }

}

function get_container(): HTMLElement {
  const elem: HTMLElement | null = document.getElementById(IndexName);
  if (!elem) {
    throw new Error(`${MyError.UnexpectedNull}: getElementById(${IndexName})`);
  }
  return elem;
}

function modetype_to_id(mode: ModeType): string {
  return (`${ClassName}-${mode}`).toLowerCase();
}

