// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { registerIcons } from 'office-ui-fabric-react/lib/Styling';

import systemTopicIcon from './images/systemTopicIcon.svg';

export function setupIcons() {
  initializeIcons(undefined, { disableWarnings: true });

  registerIcons({
    icons: {
      SystemTopic: <img alt="" aria-hidden="true" src={systemTopicIcon} style={{ width: '100%' }} />,
    },
  });
}
