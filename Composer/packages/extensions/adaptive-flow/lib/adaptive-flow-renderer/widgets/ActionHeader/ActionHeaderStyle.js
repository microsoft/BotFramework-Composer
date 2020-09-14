// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { __makeTemplateObject } from 'tslib';
import { css } from '@emotion/core';
import { ColorlessFontCSS, TruncatedCSS } from '@bfc/ui-shared';
import { StandardNodeWidth, HeaderHeight } from '../../constants/ElementSizes';
import { DisabledContainer, DisabledText } from '../styles/DisabledStyle';
var container = css(
  templateObject_1 ||
    (templateObject_1 = __makeTemplateObject(
      [
        '\n  cursor: pointer;\n  position: relative;\n  display: flex;\n  align-items: center;\n  width: ',
        'px;\n  height: ',
        'px;\n',
      ],
      [
        '\n  cursor: pointer;\n  position: relative;\n  display: flex;\n  align-items: center;\n  width: ',
        'px;\n  height: ',
        'px;\n',
      ]
    )),
  StandardNodeWidth,
  HeaderHeight
);
export var HeaderContainerCSS = function (backgroundColor) {
  if (backgroundColor === void 0) {
    backgroundColor = 'transparent';
  }
  return css(
    templateObject_2 ||
      (templateObject_2 = __makeTemplateObject(
        ['\n  ', ';\n  background-color: ', ';\n'],
        ['\n  ', ';\n  background-color: ', ';\n']
      )),
    container,
    backgroundColor
  );
};
export var DisabledHeaderContainerCSS = css(
  templateObject_3 ||
    (templateObject_3 = __makeTemplateObject(['\n  ', ';\n  ', ';\n  ', '\n'], ['\n  ', ';\n  ', ';\n  ', '\n'])),
  container,
  DisabledContainer,
  DisabledText
);
export var HeaderBodyCSS = css(
  templateObject_4 ||
    (templateObject_4 = __makeTemplateObject(
      ['\n  width: calc(100% - 40px);\n  padding: 4px 8px;\n  display: flex;\n'],
      ['\n  width: calc(100% - 40px);\n  padding: 4px 8px;\n  display: flex;\n']
    ))
);
var headerText = css(
  templateObject_5 ||
    (templateObject_5 = __makeTemplateObject(
      ['\n  ', ';\n  ', ';\n  line-height: 16px;\n  transform: translateY(-1px);\n'],
      ['\n  ', ';\n  ', ';\n  line-height: 16px;\n  transform: translateY(-1px);\n']
    )),
  ColorlessFontCSS,
  TruncatedCSS
);
export var HeaderTextCSS = function (textColor) {
  if (textColor === void 0) {
    textColor = 'black';
  }
  return css(
    templateObject_6 ||
      (templateObject_6 = __makeTemplateObject(['\n  ', ';\n  color: ', ';\n'], ['\n  ', ';\n  color: ', ';\n'])),
    headerText,
    textColor
  );
};
export var DisabledHeaderTextCSS = css(
  templateObject_7 || (templateObject_7 = __makeTemplateObject(['\n  ', ';\n  ', ';\n'], ['\n  ', ';\n  ', ';\n'])),
  headerText,
  DisabledText
);
var templateObject_1,
  templateObject_2,
  templateObject_3,
  templateObject_4,
  templateObject_5,
  templateObject_6,
  templateObject_7;
//# sourceMappingURL=ActionHeaderStyle.js.map
