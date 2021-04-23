// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useId } from '@uifabric/react-hooks';
import formatMessage from 'format-message';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import React from 'react';

const calloutProps = { gapSpace: 0 };

const genericDisableMessage = () => {
  return formatMessage('Power Virtual Agents bots cannot use this functionality at this time.');
};

export const DisableFeatureToolTip: React.FC<{ content?: string; isPVABot: boolean }> = (props) => {
  const { isPVABot, content } = props;
  const tooltipId = useId('pva-disable-tooltip');

  if (!isPVABot) {
    return <>{props.children}</>;
  }

  return (
    <TooltipHost calloutProps={calloutProps} content={content ?? genericDisableMessage()} id={tooltipId}>
      {props.children}
    </TooltipHost>
  );
};
