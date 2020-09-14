// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
export var SVGContainer = function (_a) {
  var children = _a.children,
    _b = _a.width,
    width = _b === void 0 ? 100 : _b,
    _c = _a.height,
    height = _c === void 0 ? 100 : _c,
    _d = _a.hidden,
    hidden = _d === void 0 ? false : _d;
  return jsx(
    'svg',
    {
      'aria-hidden': hidden,
      css: { overflow: 'visible', width: width, height: height, position: 'absolute', left: 0, top: 0 },
    },
    children
  );
};
//# sourceMappingURL=SVGContainer.js.map
