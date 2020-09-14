'use strict';
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, '__esModule', { value: true });
exports.ErrorMessage = void 0;
var tslib_1 = require('tslib');
var react_1 = tslib_1.__importDefault(require('react'));
var MessageBar_1 = require('office-ui-fabric-react/lib/MessageBar');
var Link_1 = require('office-ui-fabric-react/lib/Link');
var format_message_1 = tslib_1.__importDefault(require('format-message'));
var ErrorMessage = function (props) {
  var error = props.error,
    label = props.label,
    helpLink = props.helpLink;
  return react_1.default.createElement(
    MessageBar_1.MessageBar,
    {
      isMultiline: true,
      'data-testid': 'FieldErrorMessage',
      dismissButtonAriaLabel: format_message_1.default('Close'),
      messageBarType: MessageBar_1.MessageBarType.error,
    },
    [label, error].filter(Boolean).join(' '),
    helpLink &&
      react_1.default.createElement(
        Link_1.Link,
        {
          key: 'a',
          'data-testid': 'ErrorMessageHelpLink',
          href: helpLink,
          rel: 'noopener noreferrer',
          target: '_blank',
        },
        format_message_1.default('Refer to the syntax documentation here.')
      )
  );
};
exports.ErrorMessage = ErrorMessage;
//# sourceMappingURL=ErrorMessage.js.map
