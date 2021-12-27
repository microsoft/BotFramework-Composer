// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FluentTheme } from '@uifabric/fluent-theme';
import * as React from 'react';
import { HelpTooltip as SharedHelpTooltip } from '@bfc/ui-shared';

const iconStyles = {
  helpIcon: {
    color: FluentTheme.palette.neutralSecondary,
    fontSize: 12,
    lineHeight: '12px',
    cursor: 'default',
  },
};

type Props = {
  tooltipId: string;
  helpMessage: string;
};

export const HelpTooltip = React.memo((props: Props) => {
  return (
    <SharedHelpTooltip
      aria-label={props.helpMessage}
      content={props.helpMessage}
      id={props.tooltipId}
      styles={iconStyles}
    />
  );
});
