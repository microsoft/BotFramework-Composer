// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { TooltipHost, Icon } from 'office-ui-fabric-react';
import { NeutralColors } from '@uifabric/fluent-theme';

const configureResourcesIconStyle = {
  root: {
    color: NeutralColors.gray160,
    userSelect: 'none',
  },
};

export const renderPropertyInfoIcon = (tooltip: string) => {
  return (
    <TooltipHost content={tooltip}>
      <Icon iconName="Unknown" styles={configureResourcesIconStyle} />
    </TooltipHost>
  );
};
