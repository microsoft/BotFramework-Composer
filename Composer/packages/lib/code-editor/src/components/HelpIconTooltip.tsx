// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FluentTheme, NeutralColors } from '@uifabric/fluent-theme';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import * as React from 'react';

import { withTooltip, WithTooltipProps } from '../utils/withTooltip';

const iconStyles = {
  root: {
    cursor: 'default',
    lineHeight: '12px',
    fontSize: FluentTheme.fonts.small.fontSize,
    color: NeutralColors.gray130,
  },
};

export const HelpIconTooltip = React.memo(
  ({
    tooltipId,
    helpMessage,
    tooltipProps,
  }: {
    tooltipId: string;
    helpMessage: string | JSX.Element | JSX.Element[];
    tooltipProps?: WithTooltipProps;
  }) => {
    const TooltipIcon = withTooltip({ ...tooltipProps, content: helpMessage, id: tooltipId }, Icon);
    return <TooltipIcon data-testid="helpIcon" iconName={'Unknown'} styles={iconStyles} />;
  }
);
