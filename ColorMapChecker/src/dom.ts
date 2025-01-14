export function getElementByIdUnwrap(elementId: string): HTMLElement {
  const element: HTMLElement | null = document.getElementById(elementId);
  if (null === element) {
    throw new Error(`Failed to get element by id: ${elementId}`);
  }
  return element;
}
