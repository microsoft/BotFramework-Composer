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
import { css } from '@emotion/core';
export var iconCss = function (size, color) {
  return css(
    templateObject_1 ||
      (templateObject_1 = __makeTemplateObject(
        [
          '\n    width: ',
          'px;\n    height: ',
          'px;\n    border-radius: 50%;\n    background-color: ',
          ';\n    text-align: center;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n  ',
        ],
        [
          '\n    width: ',
          'px;\n    height: ',
          'px;\n    border-radius: 50%;\n    background-color: ',
          ';\n    text-align: center;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n  ',
        ]
      )),
    size,
    size,
    color || 'black'
  );
};
var templateObject_1;
//# sourceMappingURL=iconStyles.js.map
