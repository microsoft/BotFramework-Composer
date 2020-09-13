'use strict';
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, '__esModule', { value: true });
exports.oneOfField = exports.objectArrayField = exports.unsupportedField = exports.arrayItem = exports.arrayField = void 0;
var tslib_1 = require('tslib');
var core_1 = require('@emotion/core');
var fluent_theme_1 = require('@uifabric/fluent-theme');
var styling_1 = require('@uifabric/styling');
exports.arrayField = {
  field: core_1.css(
    templateObject_1 ||
      (templateObject_1 = tslib_1.__makeTemplateObject(
        [
          '\n    flex: 1;\n    margin-top: 0;\n    margin-bottom: 0;\n    display: flex;\n\n    label: ArrayFieldField;\n  ',
        ],
        [
          '\n    flex: 1;\n    margin-top: 0;\n    margin-bottom: 0;\n    display: flex;\n\n    label: ArrayFieldField;\n  ',
        ]
      ))
  ),
  inputFieldContainer: core_1.css(
    templateObject_2 ||
      (templateObject_2 = tslib_1.__makeTemplateObject(
        [
          '\n    border-top: 1px solid ',
          ';\n    display: flex;\n    padding: 7px 0px;\n\n    label: ArrayFieldInputFieldContainer;\n  ',
        ],
        [
          '\n    border-top: 1px solid ',
          ';\n    display: flex;\n    padding: 7px 0px;\n\n    label: ArrayFieldInputFieldContainer;\n  ',
        ]
      )),
    fluent_theme_1.NeutralColors.gray30
  ),
};
exports.arrayItem = {
  container: core_1.css(
    templateObject_3 ||
      (templateObject_3 = tslib_1.__makeTemplateObject(
        [
          '\n    border-top: 1px solid ',
          ';\n    display: flex;\n    padding: 7px 0;\n\n    label: ArrayFieldItemContainer;\n  ',
        ],
        [
          '\n    border-top: 1px solid ',
          ';\n    display: flex;\n    padding: 7px 0;\n\n    label: ArrayFieldItemContainer;\n  ',
        ]
      )),
    fluent_theme_1.NeutralColors.gray30
  ),
  field: core_1.css(
    templateObject_4 ||
      (templateObject_4 = tslib_1.__makeTemplateObject(
        [
          '\n    display: flex;\n    flex: 1 1 0%;\n    /* prevents field from overflowing when error present */\n    min-width: 0px;\n\n    label: ArrayFieldItemField;\n  ',
        ],
        [
          '\n    display: flex;\n    flex: 1 1 0%;\n    /* prevents field from overflowing when error present */\n    min-width: 0px;\n\n    label: ArrayFieldItemField;\n  ',
        ]
      ))
  ),
  schemaFieldOverride: function (stacked) {
    return core_1.css(
      templateObject_5 ||
        (templateObject_5 = tslib_1.__makeTemplateObject(
          [
            '\n    display: flex;\n    flex-direction: ',
            ';\n    flex: 1;\n    margin: 0;\n    /* prevents field from overflowing when error present */\n    min-width: 0px;\n\n    & + & {\n      margin-left: ',
            ';\n    }\n\n    label: ArrayItemSchemaFieldOverride;\n  ',
          ],
          [
            '\n    display: flex;\n    flex-direction: ',
            ';\n    flex: 1;\n    margin: 0;\n    /* prevents field from overflowing when error present */\n    min-width: 0px;\n\n    & + & {\n      margin-left: ',
            ';\n    }\n\n    label: ArrayItemSchemaFieldOverride;\n  ',
          ]
        )),
      stacked ? 'column' : 'row',
      stacked ? 0 : '16px'
    );
  },
};
exports.unsupportedField = {
  container: core_1.css(
    templateObject_6 ||
      (templateObject_6 = tslib_1.__makeTemplateObject(
        ['\n    display: flex;\n    justify-content: space-between;\n\n    label: UnsupportedFieldContainer;\n  '],
        ['\n    display: flex;\n    justify-content: space-between;\n\n    label: UnsupportedFieldContainer;\n  ']
      ))
  ),
  link: {
    root: {
      fontSize: styling_1.FontSizes.small,
    },
  },
  details: function (hidden) {
    return core_1.css(
      templateObject_7 ||
        (templateObject_7 = tslib_1.__makeTemplateObject(
          [
            '\n    display: ',
            ';\n    height: auto;\n    white-space: pre;\n    background: ',
            ';\n    overflow-x: scroll;\n    overflow-y: none;\n    padding: ',
            ';\n\n    label: UnsupportedFieldDetails;\n  ',
          ],
          [
            '\n    display: ',
            ';\n    height: auto;\n    white-space: pre;\n    background: ',
            ';\n    overflow-x: scroll;\n    overflow-y: none;\n    padding: ',
            ';\n\n    label: UnsupportedFieldDetails;\n  ',
          ]
        )),
      hidden ? 'none' : 'block',
      fluent_theme_1.NeutralColors.gray30,
      hidden ? '0px' : '1rem'
    );
  },
};
exports.objectArrayField = {
  objectItemLabel: core_1.css(
    templateObject_8 ||
      (templateObject_8 = tslib_1.__makeTemplateObject(
        ['\n    display: flex;\n\n    label: ObjectItemLabel;\n  '],
        ['\n    display: flex;\n\n    label: ObjectItemLabel;\n  ']
      ))
  ),
  objectItemValueLabel: core_1.css(
    templateObject_9 ||
      (templateObject_9 = tslib_1.__makeTemplateObject(
        [
          '\n    color: ',
          ';\n    flex: 1;\n    font-size: 14px;\n    margin-left: 7px;\n    & + & {\n      margin-left: 20px;\n    }\n\n    label: ObjectItemValueLabel;\n  ',
        ],
        [
          '\n    color: ',
          ';\n    flex: 1;\n    font-size: 14px;\n    margin-left: 7px;\n    & + & {\n      margin-left: 20px;\n    }\n\n    label: ObjectItemValueLabel;\n  ',
        ]
      )),
    fluent_theme_1.NeutralColors.gray130
  ),
  objectItemInputField: core_1.css(
    templateObject_10 ||
      (templateObject_10 = tslib_1.__makeTemplateObject(
        ['\n    flex: 1;\n    & + & {\n      margin-left: 20px;\n    }\n\n    label: ObjectItemInputField;\n  '],
        ['\n    flex: 1;\n    & + & {\n      margin-left: 20px;\n    }\n\n    label: ObjectItemInputField;\n  ']
      ))
  ),
  arrayItemField: core_1.css(
    templateObject_11 ||
      (templateObject_11 = tslib_1.__makeTemplateObject(
        ['\n    flex: 1;\n    display: flex;\n    min-width: 0;\n\n    label: ArrayItemField;\n  '],
        ['\n    flex: 1;\n    display: flex;\n    min-width: 0;\n\n    label: ArrayItemField;\n  ']
      ))
  ),
  inputFieldContainer: core_1.css(
    templateObject_12 ||
      (templateObject_12 = tslib_1.__makeTemplateObject(
        [
          '\n    border-top: 1px solid ',
          ';\n    display: flex;\n    padding: 7px 0;\n\n    label: InputFieldContainer;\n  ',
        ],
        [
          '\n    border-top: 1px solid ',
          ';\n    display: flex;\n    padding: 7px 0;\n\n    label: InputFieldContainer;\n  ',
        ]
      )),
    fluent_theme_1.NeutralColors.gray30
  ),
};
exports.oneOfField = {
  container: core_1.css(
    templateObject_13 ||
      (templateObject_13 = tslib_1.__makeTemplateObject(
        ['\n    width: 100%;\n\n    label: OneOfField;\n  '],
        ['\n    width: 100%;\n\n    label: OneOfField;\n  ']
      ))
  ),
  label: core_1.css(
    templateObject_14 ||
      (templateObject_14 = tslib_1.__makeTemplateObject(
        ['\n    display: flex;\n    justify-content: space-between;\n\n    label: OneOfFieldLabel;\n  '],
        ['\n    display: flex;\n    justify-content: space-between;\n\n    label: OneOfFieldLabel;\n  ']
      ))
  ),
};
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
  templateObject_14;
//# sourceMappingURL=styles.js.map
