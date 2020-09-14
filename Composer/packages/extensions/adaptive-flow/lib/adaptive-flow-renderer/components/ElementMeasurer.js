// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import Measure from 'react-measure';
import { Boundary } from '../models/Boundary';
/**
 * Notify a ReactNode's size once its size has been changed.
 * Remember to use it inside the focus border component (ElementWrapper).
 */
export var ElementMeasurer = function (_a) {
  var children = _a.children,
    style = _a.style,
    onResize = _a.onResize;
  return React.createElement(
    Measure,
    {
      bounds: true,
      onResize: function (_a) {
        var _b = _a.bounds,
          width = _b.width,
          height = _b.height;
        /**
         * As a parent node, <Measure /> mounted before children mounted.
         * Avoid flickering issue by filtering out the first onResize event.
         */
        if (width === 0 && height === 0) return;
        onResize(new Boundary(width, height));
      },
    },
    function (_a) {
      var measureRef = _a.measureRef;
      return React.createElement('div', { ref: measureRef, style: style }, children);
    }
  );
};
//# sourceMappingURL=ElementMeasurer.js.map
