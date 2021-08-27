// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Label } from 'office-ui-fabric-react/lib/Label';
import React from 'react';
import { WidgetContainerProps } from '@bfc/extension-client';

const greetings = [
  'Good afternoon',
  'Good morning',
  'Hello',
  'Hello agent!',
  'Hello and good morning',
  'Hello can you help me?',
  'Hello can you please help me',
];

const styles = {
  root: {
    selectors: { '::after': { paddingRight: '0px' }, display: 'block' },
    fontSize: '12px',
    paddingBottom: 0,
  },
};

export const GreetingWidget: React.FC<WidgetContainerProps> = () => {
  return (
    <div>
      {greetings.map((greeting, index) => (
        <Label key={`greeting-${index}`} styles={styles}>
          {greeting}
        </Label>
      ))}
    </div>
  );
};
