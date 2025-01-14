function initializeElement<T extends HTMLElement>(
  element: T,
  {
    classListItems,
    attributes,
  }: {
    classListItems: ReadonlyArray<string>;
    attributes: ReadonlyArray<{ readonly key: string; readonly value: string }>;
  },
): T {
  for (const classListItem of classListItems) {
    element.classList.add(classListItem);
  }
  for (const attribute of attributes) {
    element.setAttribute(attribute.key, attribute.value);
  }
  return element;
}

export function createChildDivElement({
  parentElement,
  classListItems,
  attributes,
}: {
  parentElement: HTMLElement;
  classListItems: ReadonlyArray<string>;
  attributes: ReadonlyArray<{ readonly key: string; readonly value: string }>;
}): HTMLDivElement {
  const tagName = "div";
  const childElement: HTMLDivElement = document.createElement(tagName);
  parentElement.appendChild(childElement);
  return initializeElement<HTMLDivElement>(childElement, {
    classListItems,
    attributes,
  });
}

export function createChildButtonElement({
  parentElement,
  classListItems,
  attributes,
}: {
  parentElement: HTMLElement;
  classListItems: ReadonlyArray<string>;
  attributes: ReadonlyArray<{ readonly key: string; readonly value: string }>;
}): HTMLButtonElement {
  const tagName = "button";
  const childElement: HTMLButtonElement = document.createElement(tagName);
  parentElement.appendChild(childElement);
  return initializeElement<HTMLButtonElement>(childElement, {
    classListItems,
    attributes,
  });
}
