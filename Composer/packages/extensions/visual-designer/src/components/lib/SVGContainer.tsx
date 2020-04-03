// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

export const SVGContainer = ({ children, hidden = false }) => (
  <svg width="100" height="100" overflow="visible" aria-hidden={hidden}>
    {children}
  </svg>
);
