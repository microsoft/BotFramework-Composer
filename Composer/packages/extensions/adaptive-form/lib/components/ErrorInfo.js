'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var react_1 = tslib_1.__importDefault(require('react'));
var format_message_1 = tslib_1.__importDefault(require('format-message'));
var MessageBar_1 = require('office-ui-fabric-react/lib/MessageBar');
var ErrorInfo = function (_a) {
  var componentStack = _a.componentStack,
    error = _a.error;
  return react_1.default.createElement(
    'div',
    { style: { marginRight: '20px' } },
    react_1.default.createElement(
      MessageBar_1.MessageBar,
      { isMultiline: false, messageBarType: MessageBar_1.MessageBarType.error },
      react_1.default.createElement(
        'p',
        { style: { whiteSpace: 'pre-wrap' } },
        react_1.default.createElement(
          'strong',
          null,
          format_message_1.default({ default: 'An error occured in the form editor!', id: 'ErrorInfo_part1' })
        ),
        react_1.default.createElement('br', null),
        format_message_1.default({
          default: 'This is likely due to malformed data or missing functionality in Composer.',
          id: 'ErrorInfo_part2',
        }),
        react_1.default.createElement('br', null),
        format_message_1.default({
          default: 'Try navigating to another node in the visual editor.',
          id: 'ErrorInfo_part3',
        })
      ),
      react_1.default.createElement('p', null, format_message_1.default('Here’s what we know…')),
      react_1.default.createElement(
        'p',
        { style: { whiteSpace: 'pre-wrap' } },
        react_1.default.createElement('strong', null, format_message_1.default('Error:')),
        ' ',
        error && error.toString()
      ),
      react_1.default.createElement(
        'p',
        { style: { whiteSpace: 'pre-wrap' } },
        react_1.default.createElement('strong', null, format_message_1.default('Component Stacktrace:')),
        ' ',
        componentStack
      )
    )
  );
};
exports.default = ErrorInfo;
//# sourceMappingURL=ErrorInfo.js.map
