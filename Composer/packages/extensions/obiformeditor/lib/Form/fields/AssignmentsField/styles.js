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
export var field = css(
  templateObject_1 || (templateObject_1 = __makeTemplateObject(['\n  margin: 10px 0;\n'], ['\n  margin: 10px 0;\n']))
);
export var assignmentItemContainer = function(align) {
  if (align === void 0) {
    align = 'center';
  }
  return css(
    templateObject_2 ||
      (templateObject_2 = __makeTemplateObject(
        ['\n  display: flex;\n  flex-wrap: wrap;\n  align-items: ', ';\n'],
        ['\n  display: flex;\n  flex-wrap: wrap;\n  align-items: ', ';\n']
      )),
    align
  );
};
export var assignmentField = css(
  templateObject_3 ||
    (templateObject_3 = __makeTemplateObject(['\n  margin-bottom: 7px;\n'], ['\n  margin-bottom: 7px;\n']))
);
export var assignmentItem = css(
  templateObject_4 ||
    (templateObject_4 = __makeTemplateObject(
      ['\n  border-bottom: 1px solid ', ';\n'],
      ['\n  border-bottom: 1px solid ', ';\n']
    )),
  NeutralColors.gray30
);
export var assignmentItemValue = css(
  templateObject_5 ||
    (templateObject_5 = __makeTemplateObject(
      ['\n  flex: 1;\n\n  & + & {\n    margin-left: 20px;\n  }\n'],
      ['\n  flex: 1;\n\n  & + & {\n    margin-left: 20px;\n  }\n']
    ))
);
export var assignmentItemLabel = css(
  templateObject_6 ||
    (templateObject_6 = __makeTemplateObject(
      ['\n  border-bottom: 1px solid ', ';\n  padding-bottom: 7px;\n'],
      ['\n  border-bottom: 1px solid ', ';\n  padding-bottom: 7px;\n']
    )),
  NeutralColors.gray30
);
export var assignmentItemValueLabel = css(
  templateObject_7 ||
    (templateObject_7 = __makeTemplateObject(
      ['\n  color: ', ';\n  font-size: 12px;\n  margin-left: 7px;\n'],
      ['\n  color: ', ';\n  font-size: 12px;\n  margin-left: 7px;\n']
    )),
  NeutralColors.gray130
);
export var assignmentItemErrorMessage = css(
  templateObject_8 ||
    (templateObject_8 = __makeTemplateObject(
      ['\n  flex-basis: 100%;\n  min-width: 0;\n'],
      ['\n  flex-basis: 100%;\n  min-width: 0;\n']
    ))
);
var templateObject_1,
  templateObject_2,
  templateObject_3,
  templateObject_4,
  templateObject_5,
  templateObject_6,
  templateObject_7,
  templateObject_8;
//# sourceMappingURL=styles.js.map
