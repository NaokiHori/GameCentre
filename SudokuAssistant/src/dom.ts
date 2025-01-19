function initializeElement(
  element: HTMLElement,
  classListItems: ReadonlyArray<string>,
  attributes: ReadonlyArray<{ readonly key: string; readonly value: string }>,
): HTMLElement {
  for (const classListItem of classListItems) {
    element.classList.add(classListItem);
  }
  for (const attribute of attributes) {
    element.setAttribute(attribute.key, attribute.value);
  }
  return element;
}

export function createChildElement({
  tagName,
  parentElement,
  classListItems,
  attributes,
}: {
  tagName: "div" | "button" | "footer" | "a";
  parentElement: HTMLElement;
  classListItems: ReadonlyArray<string>;
  attributes: ReadonlyArray<{ readonly key: string; readonly value: string }>;
}): HTMLElement {
  const childElement: HTMLElement = document.createElement(tagName);
  parentElement.appendChild(childElement);
  return initializeElement(childElement, classListItems, attributes);
}
