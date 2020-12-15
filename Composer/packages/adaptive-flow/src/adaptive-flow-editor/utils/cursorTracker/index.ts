// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AttrNames } from '../../constants/ElementAttributes';
import { KeyboardCommandTypes } from '../../constants/KeyboardCommandTypes';

import { SelectorElement } from './type';
import { handleArrowkeyMove } from './arrowMove';
import { handleTabMove } from './tabMove';

export function moveCursor(
  selectableElements: SelectorElement[],
  id: string,
  command: string
): { [key: string]: string | undefined } {
  const currentElement = selectableElements.find((element) => element.selectedId === id || element.focusedId === id);
  if (!currentElement) return { selected: id, focused: undefined };
  let element: SelectorElement;

  // tab move or arrow move
  switch (command) {
    case KeyboardCommandTypes.Cursor.MovePrevious:
    case KeyboardCommandTypes.Cursor.MoveNext:
      element = handleTabMove(currentElement, selectableElements, command);
      break;
    default:
      element = handleArrowkeyMove(currentElement, selectableElements, command);
      break;
  }

  return {
    selected: element.selectedId || id,
    focused: element.focusedId || undefined,
    tab: element.tab || '',
  };
}

export function querySelectableElements(): SelectorElement[] {
  const items: SelectorElement[] = [];
  Array.from(document.querySelectorAll(`[${AttrNames.SelectableElement}]`)).forEach((ele) => {
    items.push(new SelectorElement(ele as HTMLElement));
  });
  return items;
}

export { SelectorElement };
