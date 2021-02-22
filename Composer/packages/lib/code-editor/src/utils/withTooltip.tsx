// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { ITooltipHostProps, TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';

export type WithTooltipProps = ITooltipHostProps;

export const withTooltip = <P,>(tooltipProps: WithTooltipProps, Component: React.FC<P> | React.ComponentType<P>) => (
  props: P
) => (
  <TooltipHost {...tooltipProps}>
    <Component {...props} />
  </TooltipHost>
);
