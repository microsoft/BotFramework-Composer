// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
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
import { ObiColors } from '../../../constants/ElementColors';
import { DiamondSize } from '../../../constants/ElementSizes';
export var Diamond = function (_a) {
  var _b = _a.color,
    color = _b === void 0 ? ObiColors.AzureGray2 : _b,
    _c = _a.onClick,
    onClick = _c === void 0 ? function () {} : _c,
    rest = __rest(_a, ['color', 'onClick']);
  return jsx(
    'div',
    __assign({}, rest, {
      css: {
        width: DiamondSize.width,
        height: DiamondSize.height,
        cursor: 'pointer',
      },
      onClick: function (e) {
        e.stopPropagation();
        onClick();
      },
    }),
    jsx(
      'svg',
      {
        fill: 'none',
        height: DiamondSize.height,
        style: { display: 'block' },
        viewBox: '0 0 50 20',
        width: DiamondSize.width,
        xmlns: 'http://www.w3.org/2000/svg',
      },
      jsx('path', { d: 'M25 0L50 10L25 20L-2.7865e-06 10L25 0Z', fill: color })
    )
  );
};
//# sourceMappingURL=Diamond.js.map
