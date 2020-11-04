// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useContext } from 'react';
import Measure from 'react-measure';

import { ZoomContext } from '../../adaptive-flow-editor/contexts/ZoomContext';
import { Boundary } from '../models/Boundary';

export interface ElementMeasurerProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onResize: (boundary: Boundary) => void;
}

/**
 * Notify a ReactNode's size once its size has been changed.
 * Remember to use it inside the focus border component (ElementWrapper).
 */
export const ElementMeasurer: React.FC<ElementMeasurerProps> = ({ children, style, onResize }) => {
  const flowZoomRate = useContext(ZoomContext);
  return (
    <Measure
      bounds
      onResize={({ bounds }) => {
        /**
         * As a parent node, <Measure /> mounted before children mounted.
         * Avoid flickering issue by filtering out the first onResize event.
         */
        const { width, height } = bounds ?? { width: 0, height: 0 };
        if (width === 0 && height === 0) return;
        onResize(new Boundary(width / flowZoomRate, height / flowZoomRate));
      }}
    >
      {({ measureRef }) => (
        <div ref={measureRef} style={style}>
          {children}
        </div>
      )}
    </Measure>
  );
};
