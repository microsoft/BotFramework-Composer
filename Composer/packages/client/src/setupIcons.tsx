// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { registerIcons } from 'office-ui-fabric-react/lib/Styling';

import { SystemTopicIcon } from './icons/SystemTopicIcon';
import { HideCommentIcon } from './icons/HideCommentIcon';

export function setupIcons() {
  initializeIcons(undefined, { disableWarnings: true });

  registerIcons({
    icons: {
      SystemTopic: <SystemTopicIcon />,
      HideComment: <HideCommentIcon />,
    },
  });
}
