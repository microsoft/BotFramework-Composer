// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import Measure from 'react-measure';

import { Boundary } from '../../models/Boundary';

export interface ElementMeasurerProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onResize: (boundary: Boundary) => void;
}
export const ElementMeasurer: React.FC<ElementMeasurerProps> = ({ children, style, onResize }) => {
  return (
    <Measure
      bounds
      onResize={({ bounds: { width, height } }) => {
        onResize(new Boundary(width, height));
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
