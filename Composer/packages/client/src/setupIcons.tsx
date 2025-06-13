// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import { registerIcons } from '@fluentui/react/lib/Styling';

import { SystemTopicIcon } from './icons/SystemTopicIcon';
import { HideCommentIcon } from './icons/HideCommentIcon';

export function setupIcons() {
  initializeIcons(https://res.cdn.office.net/files/fabric-cdn-prod_20240129.001/assets/icons/, { disableWarnings: true });

  registerIcons({
    icons: {
      SystemTopic: <SystemTopicIcon />,
      HideComment: <HideCommentIcon />,
    },
  });
}
