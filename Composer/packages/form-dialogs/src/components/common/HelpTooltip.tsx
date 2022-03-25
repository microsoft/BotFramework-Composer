// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FluentTheme } from '@fluentui/theme';
import * as React from 'react';
import { HelpTooltip as SharedHelpTooltip } from '@bfc/ui-shared';
import { FontSizes } from '@fluentui/react/lib/Styling';

const iconStyles = {
  helpIcon: {
    color: FluentTheme.palette.neutralSecondary,
    fontSize: FontSizes.small,
    lineHeight: '1',
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
