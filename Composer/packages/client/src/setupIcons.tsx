// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { registerIcons } from 'office-ui-fabric-react/lib/Styling';

import { SystemTopicIcon } from './components/SystemTopicIcon';

export function setupIcons() {
  initializeIcons(undefined, { disableWarnings: true });

  registerIcons({
    icons: {
      SystemTopic: <SystemTopicIcon />,
    },
  });
}
