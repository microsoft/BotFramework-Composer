// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';

import { WidgetContainerProps } from '../schema/uischema.types';

export type DynamicBlockProps = WidgetContainerProps;

export const DynamicBlock = () => {
  const [n, setN] = useState(0);
  const texts = new Array(n).fill('hello');
  return (
    <div>
      <span>{n}</span>
      <button onClick={e => setN(n + 1)}>+</button>
      <button onClick={e => setN(Math.max(0, n - 1))}>-</button>
      {texts.map((text, index) => (
        <p key={index}>{text}</p>
      ))}
    </div>
  );
};
