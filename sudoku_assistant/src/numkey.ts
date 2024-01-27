import { MyError } from "./myerror.js";
import { Wrapper } from "./wrapper.js";
import { BoardSize } from "./board.js";

const IndexName: string = `numkeys`;
export const ClassName: string = `numkey`;

export class Numkey {

  static initialise(): void {
    const container: HTMLElement | null = document.getElementById(IndexName);
    if (!container) {
      throw new Error(`${MyError.UnexpectedNull}: getElementById(${IndexName})`);
    }
    for (let n: number = 0; n <= BoardSize.Main; n++) {
      const numkey: HTMLElement = Wrapper.create_and_append_div(container);
      numkey.classList.add(ClassName);
      numkey.textContent = 0 === n ? ` ` : `${n}`;
    }
  }

}
