// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { ActionButton, IconButton } from 'office-ui-fabric-react/lib/Button';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { Fragment } from 'react';
import { useRecoilValue } from 'recoil';

import { BotStatus } from '../../constants';
import { botEndpointsState, botStatusState, dispatcherState } from '../../recoilModel';
import TelemetryClient from '../../telemetry/TelemetryClient';

type OpenEmulatorButtonProps = {
  projectId: string;
  isRootBot: boolean;
};

export const OpenEmulatorButton: React.FC<OpenEmulatorButtonProps> = ({ projectId, isRootBot }) => {
  const { openBotInEmulator } = useRecoilValue(dispatcherState);
  const currentBotStatus = useRecoilValue(botStatusState(projectId));
  const botEndpoints = useRecoilValue(botEndpointsState);
  const endpoint = botEndpoints[projectId];

  const handleClick = () => {
    openBotInEmulator(projectId);
    TelemetryClient.track('EmulatorButtonClicked', { isRoot: isRootBot, projectId, location: 'BotController' });
  };

  return currentBotStatus === BotStatus.connected ? (
    <TooltipHost
      content={
        <Fragment>
          {endpoint}
          <IconButton iconProps={{ iconName: 'copy' }} onClick={() => navigator.clipboard.writeText(endpoint)} />
        </Fragment>
      }
    >
      <ActionButton
        iconProps={{
          iconName: 'OpenInNewTab',
        }}
        styles={{ root: { height: '20px' } }}
        onClick={handleClick}
      >
        {formatMessage('Test in Emulator')}
      </ActionButton>
    </TooltipHost>
  ) : null;
};
