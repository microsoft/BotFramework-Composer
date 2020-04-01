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
export var tabs = {
  root: {
    display: 'flex',
    padding: '0 18px',
  },
  link: {
    flex: 1,
  },
  linkIsSelected: {
    flex: 1,
  },
  itemContainer: {
    padding: '12px 12px',
  },
};
export var validationItemInput = css(
  templateObject_1 ||
    (templateObject_1 = __makeTemplateObject(
      ['\n  display: flex;\n  align-items: center;\n  padding-left: 10px;\n'],
      ['\n  display: flex;\n  align-items: center;\n  padding-left: 10px;\n']
    ))
);
export var validationItem = css(
  templateObject_2 ||
    (templateObject_2 = __makeTemplateObject(
      ['\n  ', '\n\n  border-bottom: 1px solid ', ';\n\n  &:first-of-type {\n    border-top: 1px solid ', ';\n  }\n'],
      ['\n  ', '\n\n  border-bottom: 1px solid ', ';\n\n  &:first-of-type {\n    border-top: 1px solid ', ';\n  }\n']
    )),
  validationItemInput,
  NeutralColors.gray30,
  NeutralColors.gray30
);
export var validationItemValue = css(
  templateObject_3 ||
    (templateObject_3 = __makeTemplateObject(['\n  flex: 1;\n  min-width: 0;\n'], ['\n  flex: 1;\n  min-width: 0;\n']))
);
export var field = css(
  templateObject_4 || (templateObject_4 = __makeTemplateObject(['\n  margin: 10px 0;\n'], ['\n  margin: 10px 0;\n']))
);
export var settingsContainer = css(
  templateObject_5 ||
    (templateObject_5 = __makeTemplateObject(['\n  /* padding: 24px 0; */\n'], ['\n  /* padding: 24px 0; */\n']))
);
export var settingsFields = css(
  templateObject_6 ||
    (templateObject_6 = __makeTemplateObject(
      ['\n  display: flex;\n  flex-wrap: wrap;\n  position: relative;\n  align-items: flex-end;\n'],
      ['\n  display: flex;\n  flex-wrap: wrap;\n  position: relative;\n  align-items: flex-end;\n']
    ))
);
export var settingsFieldFull = css(
  templateObject_7 ||
    (templateObject_7 = __makeTemplateObject(
      ['\n  flex-basis: 100%;\n  overflow: hidden;\n'],
      ['\n  flex-basis: 100%;\n  overflow: hidden;\n']
    ))
);
export var settingsFieldHalf = css(
  templateObject_8 ||
    (templateObject_8 = __makeTemplateObject(
      ['\n  flex: 1;\n  overflow: hidden;\n\n  & + & {\n    margin-left: 36px;\n  }\n'],
      ['\n  flex: 1;\n  overflow: hidden;\n\n  & + & {\n    margin-left: 36px;\n  }\n']
    ))
);
export var settingsFieldInline = css(
  templateObject_9 || (templateObject_9 = __makeTemplateObject(['\n  margin: 0;\n'], ['\n  margin: 0;\n']))
);
export var settingsFieldValidation = css(
  templateObject_10 ||
    (templateObject_10 = __makeTemplateObject(['\n  margin-top: -10px;\n'], ['\n  margin-top: -10px;\n']))
);
export var choiceItemContainer = function(align) {
  if (align === void 0) {
    align = 'center';
  }
  return css(
    templateObject_11 ||
      (templateObject_11 = __makeTemplateObject(
        ['\n  display: flex;\n  align-items: ', ';\n'],
        ['\n  display: flex;\n  align-items: ', ';\n']
      )),
    align
  );
};
export var choiceField = css(
  templateObject_12 ||
    (templateObject_12 = __makeTemplateObject(['\n  margin-bottom: 7px;\n'], ['\n  margin-bottom: 7px;\n']))
);
export var choiceItem = css(
  templateObject_13 ||
    (templateObject_13 = __makeTemplateObject(
      ['\n  border-bottom: 1px solid ', ';\n'],
      ['\n  border-bottom: 1px solid ', ';\n']
    )),
  NeutralColors.gray30
);
export var choiceItemValue = css(
  templateObject_14 ||
    (templateObject_14 = __makeTemplateObject(
      ['\n  flex: 1;\n\n  & + & {\n    margin-left: 20px;\n  }\n'],
      ['\n  flex: 1;\n\n  & + & {\n    margin-left: 20px;\n  }\n']
    ))
);
export var choiceItemLabel = css(
  templateObject_15 ||
    (templateObject_15 = __makeTemplateObject(
      ['\n  border-bottom: 1px solid ', ';\n  padding-bottom: 7px;\n'],
      ['\n  border-bottom: 1px solid ', ';\n  padding-bottom: 7px;\n']
    )),
  NeutralColors.gray30
);
export var choiceItemValueLabel = css(
  templateObject_16 ||
    (templateObject_16 = __makeTemplateObject(
      ['\n  color: ', ';\n  font-size: 12px;\n  margin-left: 7px;\n'],
      ['\n  color: ', ';\n  font-size: 12px;\n  margin-left: 7px;\n']
    )),
  NeutralColors.gray130
);
var templateObject_1,
  templateObject_2,
  templateObject_3,
  templateObject_4,
  templateObject_5,
  templateObject_6,
  templateObject_7,
  templateObject_8,
  templateObject_9,
  templateObject_10,
  templateObject_11,
  templateObject_12,
  templateObject_13,
  templateObject_14,
  templateObject_15,
  templateObject_16;
//# sourceMappingURL=styles.js.map
