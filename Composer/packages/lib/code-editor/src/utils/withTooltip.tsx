// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { ITooltipHostProps, TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';

type Props = ITooltipHostProps;

export const withTooltip = <P,>(tooltipProps: Props, Component: React.FC<P>) => (props: P) => (
  <TooltipHost {...tooltipProps}>
    <Component {...props} />
  </TooltipHost>
);
