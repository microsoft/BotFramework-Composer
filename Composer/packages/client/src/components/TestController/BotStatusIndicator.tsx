// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { defaultPublishConfig } from '@bfc/shared';
import { SharedColors } from '@uifabric/fluent-theme';

import { BotStatus } from '../../constants';
import { botEndpointsState, botStatusState, dispatcherState } from '../../recoilModel';

import { EmulatorOpenButton } from './emulatorOpenButton';

const POLLING_INTERVAL = 2500;
let botStatusInterval: NodeJS.Timeout | undefined = undefined;

interface BotStatusIndicatorProps {
  projectId: string;
}

const statusStyle = {
  color: SharedColors.green20,
};

export const BotStatusIndicator: React.FC<BotStatusIndicatorProps> = ({ projectId }) => {
  const currentBotStatus = useRecoilValue(botStatusState(projectId));
  const botEndpoints = useRecoilValue(botEndpointsState);
  const { openBotInEmulator, setBotStatus, getPublishStatus } = useRecoilValue(dispatcherState);
  const [botStatusText, setBotStatusText] = useState('');

  // TODO: Build a useInterval hook instead of doing it in component.
  function stopPollingRuntime() {
    if (botStatusInterval) {
      clearInterval(botStatusInterval);
      botStatusInterval = undefined;
    }
  }

  function startPollingRuntime() {
    if (!botStatusInterval) {
      const cancelInterval = setInterval(() => {
        // get publish status
        getPublishStatus(projectId, defaultPublishConfig);
      }, POLLING_INTERVAL);
      botStatusInterval = cancelInterval;
    }
  }

  useEffect(() => {
    switch (currentBotStatus) {
      case BotStatus.failed:
        stopPollingRuntime();
        setBotStatus(projectId, BotStatus.pending);
        break;
      case BotStatus.published:
        stopPollingRuntime();
        break;
      case BotStatus.reloading:
        startPollingRuntime();
        break;
      default:
      case BotStatus.connected:
        stopPollingRuntime();
        break;
    }

    if (currentBotStatus === BotStatus.connected) {
      setBotStatusText('Started');
    } else if (currentBotStatus === BotStatus.failed) {
      setBotStatusText('Error occured');
    } else {
      setBotStatusText('Inactive');
    }

    return () => {
      stopPollingRuntime();
      return;
    };
  }, [currentBotStatus]);

  return (
    <Fragment>
      {botStatusText}
      <EmulatorOpenButton
        botEndpoint={botEndpoints[projectId] || 'http://localhost:3979/api/messages'}
        botStatus={currentBotStatus}
        hidden={false}
        onClick={() => openBotInEmulator(projectId)}
      />
    </Fragment>
  );
};
