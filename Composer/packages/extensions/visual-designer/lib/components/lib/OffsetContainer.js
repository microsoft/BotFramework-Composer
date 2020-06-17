// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b;
          }) ||
        function (d, b) {
          for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function (d, b) {
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
    };
  })();
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __rest =
  (this && this.__rest) ||
  function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === 'function')
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
      }
    return t;
  };
/** @jsx jsx */
import { jsx } from '@emotion/core';
// eslint-disable-next-line no-unused-vars
import React from 'react';
var OffsetContainer = /** @class */ (function (_super) {
  __extends(OffsetContainer, _super);
  function OffsetContainer() {
    return (_super !== null && _super.apply(this, arguments)) || this;
  }
  OffsetContainer.prototype.render = function () {
    var _a = this.props,
      offset = _a.offset,
      children = _a.children,
      otherProps = __rest(_a, ['offset', 'children']);
    if (!offset) return children;
    return jsx(
      'div',
      __assign(
        {
          css: [
            {
              position: 'absolute',
              left: offset.x,
              top: offset.y,
              transitionDuration: '50ms',
              transitionProperty: 'left, right, top, bottom',
            },
          ],
        },
        otherProps
      ),
      children
    );
  };
  return OffsetContainer;
})(React.Component);
export { OffsetContainer };
//# sourceMappingURL=OffsetContainer.js.map
