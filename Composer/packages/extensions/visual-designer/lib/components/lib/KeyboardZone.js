// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __makeTemplateObject =
  (this && this.__makeTemplateObject) ||
  function (cooked, raw) {
    if (Object.defineProperty) {
      Object.defineProperty(cooked, 'raw', { value: raw });
    } else {
      cooked.raw = raw;
    }
    return cooked;
  };
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import { mapShortcutToKeyboardCommand } from '../../constants/KeyboardCommandTypes';
var styles = css(
  templateObject_1 ||
    (templateObject_1 = __makeTemplateObject(
      ['\n  border: 1px solid transparent;\n\n  &:focus {\n    outline: none;\n    border-color: black;\n  }\n'],
      ['\n  border: 1px solid transparent;\n\n  &:focus {\n    outline: none;\n    border-color: black;\n  }\n']
    ))
);
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
export var KeyboardZone = React.forwardRef(function (_a, ref) {
  var onCommand = _a.onCommand,
    children = _a.children;
  var handleKeyDown = function (e) {
    if (overriddenKeyCodes.includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
    }
    var modifierPrefix = buildModifierKeyPrefix(e);
    var shortcut = modifierPrefix + e.key;
    onCommand(mapShortcutToKeyboardCommand(shortcut), e);
  };
  return jsx(
    'div',
    { ref: ref, css: styles, 'data-test-id': 'keyboard-zone', tabIndex: 0, onKeyDown: handleKeyDown },
    children
  );
});
var templateObject_1;
//# sourceMappingURL=KeyboardZone.js.map
