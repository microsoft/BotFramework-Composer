// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FluentTheme } from '@uifabric/fluent-theme';
import { Icon, IIconProps, IIconStyles } from 'office-ui-fabric-react/lib/Icon';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { classNamesFunction } from 'office-ui-fabric-react/lib/Utilities';
import * as React from 'react';

const iconStyles = classNamesFunction<IIconProps, IIconStyles>()({
  root: {
    color: FluentTheme.palette.neutralSecondary,
    fontSize: 12,
    lineHeight: '12px',
    cursor: 'default',
  },
});

type Props = {
  tooltipId: string;
  helpMessage: string;
};

export const HelpTooltip = React.memo((props: Props) => {
  return (
    <TooltipHost content={props.helpMessage} id={props.tooltipId}>
      <Icon aria-label={props.helpMessage} iconName={'Unknown'} styles={iconStyles} />
    </TooltipHost>
  );
});
