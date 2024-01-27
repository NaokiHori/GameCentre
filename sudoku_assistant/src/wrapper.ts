import { MyError } from "./myerror.js";

export class Wrapper {

  // assume only one desired child exists and return it
  static querySelector(pelem: HTMLElement, query: string): HTMLElement {
    const celems: NodeListOf<HTMLElement> = pelem.querySelectorAll<HTMLElement>(query);
    const len: number = celems.length;
    const exp: number = 1;
    if (exp !== len) {
      throw new Error(`${MyError.UnexpectedNitems}, expected: ${exp}, length: ${len}`);
    }
    return celems[0];
  }

  // assume only one desired child exists and return it
  static querySelectorAll(pelem: HTMLElement, exp: number, query: string): NodeListOf<HTMLElement> {
    const celems: NodeListOf<HTMLElement> = pelem.querySelectorAll<HTMLElement>(query);
    const len: number = celems.length;
    if (exp !== len) {
      throw new Error(`${MyError.UnexpectedNitems}, expected: ${exp}, length: ${len}`);
    }
    return celems;
  }

  // assume textContent exists and return it
  static get_textContent(elem: HTMLElement): string {
    const text: string | null = elem.textContent;
    if (!text) {
      throw new Error(`${MyError.EmptyTextContent}: ${elem}`);
    }
    return text;
  }

  // get boolean attribute
  static get_flag(elem: HTMLElement, attr: string): boolean {
    const flag: string | null = elem.getAttribute(attr);
    if (!flag) {
      throw new Error(`${MyError.UnexpectedNull}: ${elem} ${attr}`);
    }
    switch (flag) {
      case `${true}`:
        return true;
      case `${false}`:
        return false;
      default:
        throw new Error(`${MyError.UnexpectedValue}: ${flag}`);
    }
  }

  // set boolean attribute
  static set_flag(elem: HTMLElement, attr: string, flag: boolean): void {
    elem.setAttribute(attr, flag.toString());
  }

  // wrap to create / append div element
  static create_and_append_div(pelem: HTMLElement): HTMLElement {
    const celem: HTMLElement = document.createElement(`div`);
    pelem.appendChild(celem);
    return celem;
  }

}
