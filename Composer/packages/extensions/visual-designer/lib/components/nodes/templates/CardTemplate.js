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
import { TextDiv } from '@bfc/ui-shared';
import { StandardNodeWidth, HeaderHeight, StandardSectionHeight } from '../../../constants/ElementSizes';
import { ObiColors } from '../../../constants/ElementColors';
import { ArrowLine } from '../../lib/ArrowLine';
var containerCSS = css(
  templateObject_1 ||
    (templateObject_1 = __makeTemplateObject(
      [
        '\n  font-size: 12px;\n  cursor: pointer;\n  overflow: hidden;\n  background-color: white;\n  border-radius: 2px 2px 0 0;\n  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);\n',
      ],
      [
        '\n  font-size: 12px;\n  cursor: pointer;\n  overflow: hidden;\n  background-color: white;\n  border-radius: 2px 2px 0 0;\n  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);\n',
      ]
    ))
);
var fullWidthSection = css(
  templateObject_2 ||
    (templateObject_2 = __makeTemplateObject(
      ['\n  width: 100%;\n  box-sizing: border-box;\n'],
      ['\n  width: 100%;\n  box-sizing: border-box;\n']
    ))
);
export var CardTemplate = function (_a) {
  var header = _a.header,
    body = _a.body,
    footer = _a.footer,
    onClick = _a.onClick,
    onClickHeader = _a.onClickHeader,
    onClickBody = _a.onClickBody,
    onClickFooter = _a.onClickFooter;
  var renderHeader = function (header) {
    return jsx(
      'div',
      {
        className: 'CardNode__Header',
        css: css(
          templateObject_3 ||
            (templateObject_3 = __makeTemplateObject(
              ['\n        ', ';\n        height: ', 'px;\n      '],
              ['\n        ', ';\n        height: ', 'px;\n      ']
            )),
          fullWidthSection,
          HeaderHeight
        ),
        onClick: onClickHeader,
      },
      header
    );
  };
  var renderBody = function (body) {
    return jsx(
      'div',
      {
        className: 'CardNode__Body',
        css: css(
          templateObject_4 ||
            (templateObject_4 = __makeTemplateObject(
              ['\n        ', ';\n        min-height: ', 'px;\n        padding: 7px 8px;\n      '],
              ['\n        ', ';\n        min-height: ', 'px;\n        padding: 7px 8px;\n      ']
            )),
          fullWidthSection,
          StandardSectionHeight
        ),
        onClick: onClickBody,
      },
      jsx(TextDiv, { css: { width: '100%' } }, body)
    );
  };
  var renderFooter = function (footer) {
    return jsx(
      'div',
      {
        className: 'CardNode__Footer',
        css: css(
          templateObject_5 ||
            (templateObject_5 = __makeTemplateObject(
              ['\n        ', ';\n        min-height: ', 'px;\n        padding: 8px 8px;\n      '],
              ['\n        ', ';\n        min-height: ', 'px;\n        padding: 8px 8px;\n      ']
            )),
          fullWidthSection,
          StandardSectionHeight
        ),
        onClick: onClickFooter,
      },
      jsx(TextDiv, { css: { width: '100%' } }, footer)
    );
  };
  var renderSeparateline = function () {
    return jsx(
      'div',
      {
        className: 'Separator',
        css: css(
          templateObject_6 ||
            (templateObject_6 = __makeTemplateObject(
              ['\n        display: block;\n        height: 0px;\n        overflow: visible;\n      '],
              ['\n        display: block;\n        height: 0px;\n        overflow: visible;\n      ']
            ))
        ),
      },
      jsx(ArrowLine, { arrowsize: 8, color: ObiColors.AzureGray3, width: StandardNodeWidth })
    );
  };
  // If body is null but footer not null, show footer as body.
  var _b = [body, footer].filter(function (x) {
      return x !== undefined && x !== null;
    }),
    displayedBody = _b[0],
    displayedFooter = _b[1];
  var showFooter = displayedFooter !== undefined;
  return jsx(
    'div',
    {
      className: 'CardNode',
      css: css(
        templateObject_7 ||
          (templateObject_7 = __makeTemplateObject(
            ['\n        ', ';\n        width: ', 'px;\n        min-height: ', 'px;\n      '],
            ['\n        ', ';\n        width: ', 'px;\n        min-height: ', 'px;\n      ']
          )),
        containerCSS,
        StandardNodeWidth,
        HeaderHeight
      ),
      onClick: onClick
        ? function (e) {
            e.stopPropagation();
            onClick(e);
          }
        : undefined,
    },
    renderHeader(header),
    renderBody(displayedBody),
    showFooter ? renderSeparateline() : null,
    showFooter ? renderFooter(footer) : null
  );
};
var templateObject_1,
  templateObject_2,
  templateObject_3,
  templateObject_4,
  templateObject_5,
  templateObject_6,
  templateObject_7;
//# sourceMappingURL=CardTemplate.js.map
