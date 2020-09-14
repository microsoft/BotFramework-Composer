'use strict';
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, '__esModule', { value: true });
exports.LoadingTimeout = void 0;
var tslib_1 = require('tslib');
/** @jsx jsx */
var core_1 = require('@emotion/core');
var react_1 = require('react');
var core_2 = require('@emotion/core');
var format_message_1 = tslib_1.__importDefault(require('format-message'));
var Spinner_1 = require('office-ui-fabric-react/lib/Spinner');
var container = core_2.css(
  templateObject_1 ||
    (templateObject_1 = tslib_1.__makeTemplateObject(
      ['\n  height: 100%;\n  width: 100%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n'],
      ['\n  height: 100%;\n  width: 100%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n']
    ))
);
var LoadingTimeout = function (props) {
  var children = props.children,
    _a = props.timeout,
    timeout = _a === void 0 ? 1000 : _a;
  var _b = react_1.useState(false),
    showFallback = _b[0],
    setShowFallback = _b[1];
  react_1.useEffect(function () {
    var tId = setTimeout(function () {
      setShowFallback(true);
    }, timeout);
    return function () {
      clearTimeout(tId);
    };
  }, []);
  return showFallback
    ? core_1.jsx('div', null, children)
    : core_1.jsx(
        'div',
        { css: container },
        core_1.jsx(Spinner_1.Spinner, { label: format_message_1.default('Loading') })
      );
};
exports.LoadingTimeout = LoadingTimeout;
var templateObject_1;
//# sourceMappingURL=LoadingTimeout.js.map
