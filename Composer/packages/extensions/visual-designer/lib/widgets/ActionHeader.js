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
import { generateSDKTitle } from '@bfc/shared';
import { TruncatedCSS, ColorlessFontCSS } from '@bfc/ui-shared';
import { StandardNodeWidth, HeaderHeight } from '../constants/ElementSizes';
import { DefaultColors } from '../constants/ElementColors';
import { NodeMenu } from '../components/menus/NodeMenu';
import { ElementIcon } from '../utils/obiPropertyResolver';
import { Icon } from '../components/decorations/icon';
var container = css(
  templateObject_1 ||
    (templateObject_1 = __makeTemplateObject(
      ['\n  cursor: pointer;\n  position: relative;\n  display: flex;\n  align-items: center;\n'],
      ['\n  cursor: pointer;\n  position: relative;\n  display: flex;\n  align-items: center;\n']
    ))
);
export var ActionHeader = function (_a) {
  var id = _a.id,
    data = _a.data,
    onEvent = _a.onEvent,
    _b = _a.title,
    title = _b === void 0 ? '' : _b,
    disableSDKTitle = _a.disableSDKTitle,
    icon = _a.icon,
    menu = _a.menu,
    _c = _a.colors,
    colors = _c === void 0 ? DefaultColors : _c;
  var headerContent = disableSDKTitle ? title : generateSDKTitle(data, title);
  var headerText = css(
    templateObject_2 ||
      (templateObject_2 = __makeTemplateObject(['\n    ', ';\n    ', ';\n  '], ['\n    ', ';\n    ', ';\n  '])),
    ColorlessFontCSS,
    TruncatedCSS
  );
  return jsx(
    'div',
    {
      css: css(
        templateObject_3 ||
          (templateObject_3 = __makeTemplateObject(
            [
              '\n        ',
              ';\n        width: ',
              'px;\n        height: ',
              'px;\n        background-color: ',
              ';\n      ',
            ],
            [
              '\n        ',
              ';\n        width: ',
              'px;\n        height: ',
              'px;\n        background-color: ',
              ';\n      ',
            ]
          )),
        container,
        StandardNodeWidth,
        HeaderHeight,
        colors.theme
      ),
    },
    jsx(
      'div',
      {
        css: css(
          templateObject_4 ||
            (templateObject_4 = __makeTemplateObject(
              [
                '\n          width: calc(100% - 40px);\n          padding: 4px 8px;\n          display: flex;\n        ',
              ],
              ['\n          width: calc(100% - 40px);\n          padding: 4px 8px;\n          display: flex;\n        ']
            ))
        ),
      },
      icon &&
        icon !== ElementIcon.None &&
        jsx(
          'div',
          {
            'aria-hidden': true,
            css: {
              width: 16,
              height: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '5px',
            },
          },
          jsx(Icon, { color: colors.icon, icon: icon, size: 16 })
        ),
      jsx(
        'div',
        {
          'aria-label': headerContent,
          css: css(
            templateObject_5 ||
              (templateObject_5 = __makeTemplateObject(
                [
                  '\n            ',
                  ';\n            line-height: 16px;\n            transform: translateY(-1px);\n            color: ',
                  ';\n          ',
                ],
                [
                  '\n            ',
                  ';\n            line-height: 16px;\n            transform: translateY(-1px);\n            color: ',
                  ';\n          ',
                ]
              )),
            headerText,
            colors.color || 'black'
          ),
        },
        headerContent
      )
    ),
    jsx('div', null, menu === 'none' ? null : menu || jsx(NodeMenu, { colors: colors, id: id, onEvent: onEvent }))
  );
};
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5;
//# sourceMappingURL=ActionHeader.js.map
