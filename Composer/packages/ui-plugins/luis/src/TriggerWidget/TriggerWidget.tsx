// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { WidgetContainerProps, useShellApi } from '@bfc/extension-client';
import { Label } from 'office-ui-fabric-react/lib/Label';
import React from 'react';

export const TriggerWidget: React.FC<WidgetContainerProps> = ({ data }) => {
  const {
    shellApi: { getTriggerPhrasesForAnIntent },
  } = useShellApi();

  const triggerPhrases = data.intent ? getTriggerPhrasesForAnIntent(data.intent) : [];

  return (
    <div
      style={{
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'column',
        height: '100px',
        overflow: 'auto',
      }}
    >
      {triggerPhrases.length === 0 && <span>Trigger Phrases</span>}
      {triggerPhrases.map((phrase, index) => (
        <Label
          key={`phrases-${index}`}
          styles={{
            root: {
              selectors: { '::after': { paddingRight: '0px' }, display: 'block' },
              fontSize: '12px',
              paddingBottom: 0,
            },
          }}
        >
          {phrase.substring(1)}
        </Label>
      ))}
    </div>
  );
};
