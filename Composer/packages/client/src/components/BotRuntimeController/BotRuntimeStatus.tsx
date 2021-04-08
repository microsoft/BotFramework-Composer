// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { defaultPublishConfig } from '@bfc/shared';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import * as React from 'react';

import { BotStatus } from '../../constants';
import { botStatusState, dispatcherState } from '../../recoilModel';
import { useInterval } from '../../utils/hooks';
import TelemetryClient from '../../telemetry/TelemetryClient';

import { useBotOperations } from './useBotOperations';

const pollingInterval = 1500;

export type BotRuntimeStatusProps = {
  projectId: string;
};

export const BotRuntimeStatus = React.memo((props: BotRuntimeStatusProps) => {
  const { projectId } = props;

  const currentBotStatus = useRecoilValue(botStatusState(projectId));
  const { getPublishStatus } = useRecoilValue(dispatcherState);
  const [isRunning, setIntervalRunning] = useState(false);
  const { startSingleBot, stopSingleBot } = useBotOperations();

  useInterval(
    () => {
      getPublishStatus(projectId, defaultPublishConfig);
    },
    isRunning ? pollingInterval : null
  );

  useEffect(() => {
    switch (currentBotStatus) {
      case BotStatus.failed:
        setIntervalRunning(false);
        stopSingleBot(projectId);
        TelemetryClient.track('StartBotCompleted', { projectId, status: currentBotStatus });
        break;
      case BotStatus.published:
        setIntervalRunning(false);
        startSingleBot(projectId, true);
        break;
      case BotStatus.starting:
        setIntervalRunning(true);
        break;

      case BotStatus.connected: {
        setIntervalRunning(false);
        TelemetryClient.track('StartBotCompleted', { projectId, status: currentBotStatus });
        break;
      }
    }
  }, [currentBotStatus]);

  return null;
});
