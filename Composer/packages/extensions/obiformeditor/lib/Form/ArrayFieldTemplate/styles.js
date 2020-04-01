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
      ['\n  display: flex;\n  padding: 4px 0;\n\n  border-top: 1px solid ', ';\n'],
      ['\n  display: flex;\n  padding: 4px 0;\n\n  border-top: 1px solid ', ';\n']
    )),
  NeutralColors.gray30
);
export var arrayItemInputFieldContainer = css(
  templateObject_2 ||
    (templateObject_2 = __makeTemplateObject(
      ['\n  border-top: 1px solid ', ';\n  display: flex;\n  padding: 8px 0;\n'],
      ['\n  border-top: 1px solid ', ';\n  display: flex;\n  padding: 8px 0;\n']
    )),
  NeutralColors.gray30
);
export var objectItemLabel = css(
  templateObject_3 || (templateObject_3 = __makeTemplateObject(['\n  display: flex;\n'], ['\n  display: flex;\n']))
);
export var objectItemValueLabel = css(
  templateObject_4 ||
    (templateObject_4 = __makeTemplateObject(
      [
        '\n  color: ',
        ';\n  flex: 1;\n  font-size: 14px;\n  margin-left: 4px;\n  & + & {\n    margin-left: 20px;\n  }\n',
      ],
      [
        '\n  color: ',
        ';\n  flex: 1;\n  font-size: 14px;\n  margin-left: 4px;\n  & + & {\n    margin-left: 20px;\n  }\n',
      ]
    )),
  NeutralColors.gray130
);
export var objectItemInputField = css(
  templateObject_5 ||
    (templateObject_5 = __makeTemplateObject(
      ['\n  flex: 1;\n  & + & {\n    margin-left: 20px;\n  }\n'],
      ['\n  flex: 1;\n  & + & {\n    margin-left: 20px;\n  }\n']
    ))
);
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5;
//# sourceMappingURL=styles.js.map
