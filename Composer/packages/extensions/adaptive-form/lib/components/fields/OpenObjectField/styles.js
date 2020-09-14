'use strict';
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, '__esModule', { value: true });
exports.labelContainer = exports.label = exports.item = exports.filler = exports.addButtonContainer = exports.itemContainer = exports.container = void 0;
var tslib_1 = require('tslib');
var core_1 = require('@emotion/core');
var fluent_theme_1 = require('@uifabric/fluent-theme');
exports.container = core_1.css(
  templateObject_1 ||
    (templateObject_1 = tslib_1.__makeTemplateObject(
      ['\n  border-top: 1px solid ', ';\n  display: flex;\n\n  label: OpenObjectFieldContainer;\n'],
      ['\n  border-top: 1px solid ', ';\n  display: flex;\n\n  label: OpenObjectFieldContainer;\n']
    )),
  fluent_theme_1.NeutralColors.gray30
);
exports.itemContainer = function (stackedLayout) {
  return core_1.css(
    templateObject_2 ||
      (templateObject_2 = tslib_1.__makeTemplateObject(
        ['\n  display: flex;\n  flex: 1;\n  flex-direction: ', ';\n\n  label: OpenObjectFieldItemContainer;\n'],
        ['\n  display: flex;\n  flex: 1;\n  flex-direction: ', ';\n\n  label: OpenObjectFieldItemContainer;\n']
      )),
    stackedLayout ? 'column' : 'row'
  );
};
exports.addButtonContainer = core_1.css(
  templateObject_3 ||
    (templateObject_3 = tslib_1.__makeTemplateObject(
      ['\n  border-top: 1px solid ', ';\n  padding: 8px 0;\n'],
      ['\n  border-top: 1px solid ', ';\n  padding: 8px 0;\n']
    )),
  fluent_theme_1.NeutralColors.gray30
);
exports.filler = core_1.css(
  templateObject_4 ||
    (templateObject_4 = tslib_1.__makeTemplateObject(
      ['\n  width: 32px;\n\n  label: OpenObjectFieldFiller;\n'],
      ['\n  width: 32px;\n\n  label: OpenObjectFieldFiller;\n']
    ))
);
exports.item = function (stackedLayout) {
  return core_1.css(
    templateObject_5 ||
      (templateObject_5 = tslib_1.__makeTemplateObject(
        ['\n  flex: 1;\n\n  & + & {\n    margin-left: ', ';\n  }\n\n  label: OpenObjectFieldItem;\n'],
        ['\n  flex: 1;\n\n  & + & {\n    margin-left: ', ';\n  }\n\n  label: OpenObjectFieldItem;\n']
      )),
    !stackedLayout ? '16px' : '0'
  );
};
exports.label = core_1.css(
  templateObject_6 ||
    (templateObject_6 = tslib_1.__makeTemplateObject(
      [
        '\n  flex: 1;\n  padding-left: 8px;\n\n  & + & {\n    margin-left: 16px;\n  }\n\n  label: OpenObjectFieldLabel;\n',
      ],
      [
        '\n  flex: 1;\n  padding-left: 8px;\n\n  & + & {\n    margin-left: 16px;\n  }\n\n  label: OpenObjectFieldLabel;\n',
      ]
    ))
);
exports.labelContainer = core_1.css(
  templateObject_7 ||
    (templateObject_7 = tslib_1.__makeTemplateObject(
      ['\n  display: flex;\n\n  label: OpenObjectFieldLabelContainer;\n'],
      ['\n  display: flex;\n\n  label: OpenObjectFieldLabelContainer;\n']
    ))
);
var templateObject_1,
  templateObject_2,
  templateObject_3,
  templateObject_4,
  templateObject_5,
  templateObject_6,
  templateObject_7;
//# sourceMappingURL=styles.js.map
