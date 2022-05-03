// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { HelpTooltip, HelpTooltipProps } from '@bfc/ui-shared';
import { FluentTheme, NeutralColors } from '@fluentui/theme';
import * as React from 'react';

const tooltipStyles = {
  root: {
    padding: 0,
  },
  helpIcon: {
    fontSize: FluentTheme.fonts.small.fontSize,
    color: NeutralColors.gray130,
    lineHeight: '14px',
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
    tooltipProps: HelpTooltipProps;
  }) => {
    return (
      <HelpTooltip
        {...tooltipProps}
        content={helpMessage}
        iconProps={{ 'data-testid': 'helpIcon' }}
        id={tooltipId}
        styles={tooltipStyles}
      />
    );
  }
);
