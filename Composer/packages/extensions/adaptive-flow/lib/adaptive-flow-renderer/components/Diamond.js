// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { __assign, __rest } from 'tslib';
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { ObiColors } from '../constants/ElementColors';
import { DiamondSize } from '../constants/ElementSizes';
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
