'use strict';
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, '__esModule', { value: true });
exports.focusBorder = void 0;
var tslib_1 = require('tslib');
var core_1 = require('@emotion/core');
exports.focusBorder = core_1.css(
  templateObject_1 ||
    (templateObject_1 = tslib_1.__makeTemplateObject(
      [
        "\n  &:focus {\n    outline: none !important;\n    position: relative;\n\n    &::after {\n      content: '';\n      position: absolute;\n      top: 0;\n      bottom: 0;\n      left: 0;\n      right: 0;\n      border: 1px solid black;\n    }\n  }\n",
      ],
      [
        "\n  &:focus {\n    outline: none !important;\n    position: relative;\n\n    &::after {\n      content: '';\n      position: absolute;\n      top: 0;\n      bottom: 0;\n      left: 0;\n      right: 0;\n      border: 1px solid black;\n    }\n  }\n",
      ]
    ))
);
var templateObject_1;
//# sourceMappingURL=sharedStyles.js.map
