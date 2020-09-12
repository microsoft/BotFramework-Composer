// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { AttrNames } from '../../constants/ElementAttributes';
import { KeyboardCommandTypes } from '../../constants/KeyboardCommandTypes';
import { SelectorElement } from './type';
import { handleArrowkeyMove } from './arrowMove';
import { handleTabMove } from './tabMove';
export function moveCursor(selectableElements, id, command) {
    var currentElement = selectableElements.find(function (element) { return element.selectedId === id || element.focusedId === id; });
    if (!currentElement)
        return { selected: id, focused: undefined };
    var element = currentElement;
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
export function querySelectableElements() {
    var items = [];
    Array.from(document.querySelectorAll("[" + AttrNames.SelectableElement + "]")).forEach(function (ele) {
        items.push(new SelectorElement(ele));
    });
    return items;
}
export { SelectorElement };
//# sourceMappingURL=index.js.map