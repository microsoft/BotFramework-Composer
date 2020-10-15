// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { defaultPublishConfig } from '@bfc/shared';
import formatMessage from 'format-message';

import { BotStatus, BotStatusesCopy } from '../../constants';
import { botEndpointsState, botStatusState, dispatcherState } from '../../recoilModel';
import { botRuntimeOperationsSelector } from '../../recoilModel/selectors/botRuntimeOperations';
import { useInterval } from '../../utils/hooks';

import { EmulatorOpenButton } from './emulatorOpenButton';

const POLLING_INTERVAL = 2500;

interface BotStatusIndicatorProps {
  projectId: string;
}

export const BotStatusIndicator: React.FC<BotStatusIndicatorProps> = ({ projectId }) => {
  const currentBotStatus = useRecoilValue(botStatusState(projectId));
  const botEndpoints = useRecoilValue(botEndpointsState);
  const { openBotInEmulator, setBotStatus, getPublishStatus } = useRecoilValue(dispatcherState);
  const [botStatusText, setBotStatusText] = useState('');
  const operations = useRecoilValue(botRuntimeOperationsSelector);
  const [isRunning, setIntervalRunning] = useState(false);

  useInterval(
    () => {
      getPublishStatus(projectId, defaultPublishConfig);
    },
    isRunning ? POLLING_INTERVAL : null
  );

  useEffect(() => {
    switch (currentBotStatus) {
      case BotStatus.failed:
        setBotStatusText(BotStatusesCopy[BotStatus.failed]);
        setIntervalRunning(false);
        break;
      case BotStatus.published:
        setBotStatusText(BotStatusesCopy[BotStatus.published]);
        setIntervalRunning(false);
        operations?.startBot(projectId);
        break;
      case BotStatus.reloading:
        setBotStatusText(BotStatusesCopy[BotStatus.reloading]);
        setIntervalRunning(true);
        break;

      case BotStatus.connected:
        setIntervalRunning(false);
        setBotStatusText(BotStatusesCopy[BotStatus.connected]);
        break;

      case BotStatus.publishing:
        setBotStatusText(BotStatusesCopy[BotStatus.publishing]);
        break;

      default:
      case BotStatus.unConnected:
        setBotStatusText(BotStatusesCopy[BotStatus.unConnected]);
        break;
    }
  }, [currentBotStatus]);

  return (
    <Fragment>
      <span>{botStatusText}</span>
      <EmulatorOpenButton
        botEndpoint={botEndpoints[projectId] || 'http://localhost:3979/api/messages'}
        botStatus={currentBotStatus}
        hidden={false}
        onClick={() => openBotInEmulator(projectId)}
      />
    </Fragment>
  );
};
