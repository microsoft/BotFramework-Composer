// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __makeTemplateObject =
  (this && this.__makeTemplateObject) ||
  function(cooked, raw) {
    if (Object.defineProperty) {
      Object.defineProperty(cooked, 'raw', { value: raw });
    } else {
      cooked.raw = raw;
    }
    return cooked;
  };
import { css } from '@emotion/core';
import { NeutralColors } from '@uifabric/fluent-theme';
export var arrayItem = css(
  templateObject_1 ||
    (templateObject_1 = __makeTemplateObject(
      ['\n  display: flex;\n  align-items: center;\n  padding-left: 10px;\n\n  & + & {\n    margin-top: 10px;\n  }\n'],
      ['\n  display: flex;\n  align-items: center;\n  padding-left: 10px;\n\n  & + & {\n    margin-top: 10px;\n  }\n']
    ))
);
export var arrayItemValue = css(
  templateObject_2 || (templateObject_2 = __makeTemplateObject(['\n  flex: 1;\n'], ['\n  flex: 1;\n']))
);
export var arrayItemDefault = css(
  templateObject_3 || (templateObject_3 = __makeTemplateObject(['\n  font-size: 14px;\n'], ['\n  font-size: 14px;\n']))
);
export var field = css(
  templateObject_4 || (templateObject_4 = __makeTemplateObject(['\n  margin: 10px 0;\n'], ['\n  margin: 10px 0;\n']))
);
export var customObjectFieldContainer = css(
  templateObject_5 ||
    (templateObject_5 = __makeTemplateObject(
      ['\n  display: flex;\n\n  &:not(:last-child) {\n    border-bottom: 1px solid ', ';\n  }\n'],
      ['\n  display: flex;\n\n  &:not(:last-child) {\n    border-bottom: 1px solid ', ';\n  }\n']
    )),
  NeutralColors.gray30
);
export var customObjectFieldItem = css(
  templateObject_6 ||
    (templateObject_6 = __makeTemplateObject(
      ['\n  flex: 1;\n\n  & + & {\n    margin-left: 20px;\n  }\n'],
      ['\n  flex: 1;\n\n  & + & {\n    margin-left: 20px;\n  }\n']
    ))
);
export var customObjectFieldLabel = css(
  templateObject_7 ||
    (templateObject_7 = __makeTemplateObject(
      ['\n  color: ', ';\n  font-size: 12px;\n  margin-left: 7px;\n  padding-bottom: 5px;\n'],
      ['\n  color: ', ';\n  font-size: 12px;\n  margin-left: 7px;\n  padding-bottom: 5px;\n']
    )),
  NeutralColors.gray130
);
var templateObject_1,
  templateObject_2,
  templateObject_3,
  templateObject_4,
  templateObject_5,
  templateObject_6,
  templateObject_7;
//# sourceMappingURL=styles.js.map
