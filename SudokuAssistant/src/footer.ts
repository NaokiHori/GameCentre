import { createChildElement } from "./dom";
import { Body } from "./body";

export function createFooterElement(body: Body) {
  // <footer>
  //   <a href="xxx">
  //     Copyright
  //   </a>
  // </footre>
  createChildElement({
    tagName: "a",
    parentElement: createChildElement({
      tagName: "footer",
      parentElement: body.element,
      classListItems: [],
      attributes: [],
    }),
    classListItems: [],
    attributes: [
      {
        key: "href",
        value: "https://github.com/NaokiHori/Trash/tree/main/SudokuAssistant",
      },
    ],
  }).innerHTML = "&#xA9; 2023 Naoki Hori";
}
