// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { mapShortcutToKeyboardCommand } from '../constants/KeyboardCommandTypes';
var KeyNameByModifierAttr = {
  ctrlKey: 'Control',
  metaKey: 'Meta',
  altKey: 'Alt',
  shiftKey: 'Shift',
};
var overriddenKeyCodes = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
var isMac = function () {
  return /macintosh|mac os x/i.test(navigator.userAgent);
};
var buildModifierKeyPrefix = function (e) {
  var prefix = isMac() ? 'Mac.' : 'Windows.';
  ['ctrlKey', 'metaKey', 'altKey', 'shiftKey'].forEach(function (modifierAttr) {
    if (e[modifierAttr]) {
      prefix += KeyNameByModifierAttr[modifierAttr] + '.';
    }
  });
  return prefix;
};
export var enableKeyboardCommandAttributes = function (onCommand) {
  var handleKeyDown = function (e) {
    if (overriddenKeyCodes.includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
    }
    var modifierPrefix = buildModifierKeyPrefix(e);
    var shortcut = modifierPrefix + e.key;
    onCommand(mapShortcutToKeyboardCommand(shortcut), e);
  };
  return {
    onKeyDown: handleKeyDown,
  };
};
//# sourceMappingURL=KeyboardZone.js.map
