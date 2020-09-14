'use strict';
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* istanbul ignore file */
Object.defineProperty(exports, '__esModule', { value: true });
exports.Link = void 0;
var tslib_1 = require('tslib');
/** @jsx jsx */
var core_1 = require('@emotion/core');
var Link_1 = require('office-ui-fabric-react/lib/Link');
var sharedStyles_1 = require('./sharedStyles');
var Link = function (props) {
  return core_1.jsx(Link_1.Link, tslib_1.__assign({ css: sharedStyles_1.focusBorder }, props), props.children);
};
exports.Link = Link;
//# sourceMappingURL=Link.js.map
