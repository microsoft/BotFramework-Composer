// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useId } from '@uifabric/react-hooks';
import formatMessage from 'format-message';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import React from 'react';
import { useRecoilValue } from 'recoil';

import { usePVACheck } from '../hooks/usePVACheck';
import { rootBotProjectIdSelector } from '../recoilModel';

const calloutProps = { gapSpace: 0 };

const genericDisableMessage = () => {
  return formatMessage('PVA bots cannot use this functionality at this time.');
};

export const PVADisableFeature: React.FC<{ content?: string; projectId?: string }> = (props) => {
  const rootBotId = useRecoilValue(rootBotProjectIdSelector);
  const currentProjectId = props.projectId ?? rootBotId ?? '';
  const isPVABot = usePVACheck(currentProjectId);

  const tooltipId = useId('pva-disable-tooltip');

  if (!isPVABot) {
    return <>{props.children}</>;
  }

  return (
    <TooltipHost calloutProps={calloutProps} content={props.content ?? genericDisableMessage()} id={tooltipId}>
      {props.children}
    </TooltipHost>
  );
};
