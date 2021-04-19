// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { TooltipHost, DirectionalHint } from 'office-ui-fabric-react/lib/Tooltip';

type TreeItemContentProps = {
  tooltip?: string | JSX.Element | JSX.Element[];
};

export const TreeItemContent: React.FC<TreeItemContentProps> = ({ children, tooltip }) => {
  if (tooltip) {
    return (
      <TooltipHost content={tooltip} directionalHint={DirectionalHint.bottomCenter}>
        {children}
      </TooltipHost>
    );
  }

  return <React.Fragment>{children}</React.Fragment>;
};
