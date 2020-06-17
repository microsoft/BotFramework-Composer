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
export var collapseContainer = css(
  templateObject_1 ||
    (templateObject_1 = __makeTemplateObject(
      [
        '\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  width: 100%;\n  max-width: 1008px;\n  min-width: 432px;\n  margin: 0 auto;\n',
      ],
      [
        '\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  width: 100%;\n  max-width: 1008px;\n  min-width: 432px;\n  margin: 0 auto;\n',
      ]
    ))
);
export var collapseHeader = css(
  templateObject_2 ||
    (templateObject_2 = __makeTemplateObject(
      ['\n  display: flex;\n  align-items: center;\n  width: 100%;\n'],
      ['\n  display: flex;\n  align-items: center;\n  width: 100%;\n']
    ))
);
export var headerText = css(
  templateObject_3 ||
    (templateObject_3 = __makeTemplateObject(
      ['\n  color: #605e5c;\n  font-size: 12px;\n  line-height: 19px;\n  height: 22px;\n  margin-right: 20px;\n'],
      ['\n  color: #605e5c;\n  font-size: 12px;\n  line-height: 19px;\n  height: 22px;\n  margin-right: 20px;\n']
    ))
);
export var headerIcon = css(
  templateObject_4 ||
    (templateObject_4 = __makeTemplateObject(
      ['\n  flex: 1;\n  border: 0.5px solid #000000;\n  transform: rotate(0.01deg);\n'],
      ['\n  flex: 1;\n  border: 0.5px solid #000000;\n  transform: rotate(0.01deg);\n']
    ))
);
export var headerButton = function (collapsed) {
  return css(
    templateObject_5 ||
      (templateObject_5 = __makeTemplateObject(
        ['\n  transform: ', ';\n  margin-left: 12px;\n  transition: transform 0.2s linear;\n'],
        ['\n  transform: ', ';\n  margin-left: 12px;\n  transition: transform 0.2s linear;\n']
      )),
    collapsed ? 'rotate(270deg)' : 'rotate(90deg)'
  );
};
export var collapseContent = function (collapsed) {
  return css(
    templateObject_6 ||
      (templateObject_6 = __makeTemplateObject(['\n    display: ', ';\n  '], ['\n    display: ', ';\n  '])),
    collapsed ? 'none' : 'block'
  );
};
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6;
//# sourceMappingURL=CollapseStyles.js.map
