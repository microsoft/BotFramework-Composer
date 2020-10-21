// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { defaultPublishConfig } from '@bfc/shared';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';

import { BotStatus, BotStatusesCopy } from '../../constants';
import { botEndpointsState, botRuntimeErrorState, botStatusState, dispatcherState } from '../../recoilModel';
import { botRuntimeOperationsSelector } from '../../recoilModel/selectors/localRuntimeBuilder';
import { useInterval } from '../../utils/hooks';

import { EmulatorOpenButton } from './emulatorOpenButton';
import { ErrorCallout } from './errorCallout';
import { useBotOperations } from './useLocalBotOperations';

const actionButton = css`
  color: #0078d4;
`;

const botStatusContainer = css`
  display: flex;
  align-items: center;
`;

const POLLING_INTERVAL = 2500;

interface LocalBotStatusIndicatorProps {
  projectId: string;
}

export const LocalBotStatusIndicator: React.FC<LocalBotStatusIndicatorProps> = ({ projectId }) => {
  const currentBotStatus = useRecoilValue(botStatusState(projectId));
  const botEndpoints = useRecoilValue(botEndpointsState);
  const { openBotInEmulator, getPublishStatus } = useRecoilValue(dispatcherState);
  const [botStatusText, setBotStatusText] = useState('');
  const operations = useRecoilValue(botRuntimeOperationsSelector);
  const [isRunning, setIntervalRunning] = useState(false);
  const botActionRef = useRef(null);
  const botLoadErrorMsg = useRecoilValue(botRuntimeErrorState(projectId));
  const [calloutVisible, setErrorCallout] = useState(false);
  const { startSingleBot, stopSingleBot } = useBotOperations();

  useInterval(
    () => {
      getPublishStatus(projectId, defaultPublishConfig);
    },
    isRunning ? POLLING_INTERVAL : null
  );

  function dismissErrorDialog() {
    setErrorCallout(false);
  }

  function openErrorDialog() {
    setErrorCallout(true);
  }

  useEffect(() => {
    switch (currentBotStatus) {
      case BotStatus.failed:
        setBotStatusText(BotStatusesCopy[BotStatus.failed]);
        setIntervalRunning(false);
        stopSingleBot(projectId);
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

      case BotStatus.connected: {
        // Runtime errors aren't surface immediately. Stop the interval after one more ping
        setBotStatusText(BotStatusesCopy[BotStatus.connected]);
        setIntervalRunning(false);
        setTimeout(() => {
          getPublishStatus(projectId, defaultPublishConfig);
        }, 3000);
        break;
      }
      case BotStatus.publishing:
        setBotStatusText(BotStatusesCopy[BotStatus.publishing]);
        break;

      default:
      case BotStatus.unConnected:
        setBotStatusText(BotStatusesCopy[BotStatus.unConnected]);
        break;
    }

    return () => {
      dismissErrorDialog();
    };
  }, [currentBotStatus]);

  const onTryStartAgain = () => {
    dismissErrorDialog();
    startSingleBot(projectId);
  };

  return (
    <div ref={botActionRef} css={botStatusContainer}>
      <span>{botStatusText}</span>
      <EmulatorOpenButton
        botEndpoint={botEndpoints[projectId] || 'http://localhost:3979/api/messages'}
        botStatus={currentBotStatus}
        hidden={false}
        onClick={() => openBotInEmulator(projectId)}
      />
      {botLoadErrorMsg?.message && (
        <ActionButton
          css={actionButton}
          onClick={() => {
            openErrorDialog();
          }}
        >
          <span>{formatMessage('See details')}</span>
        </ActionButton>
      )}
      <ErrorCallout
        error={botLoadErrorMsg}
        target={botActionRef.current}
        visible={calloutVisible}
        onDismiss={dismissErrorDialog}
        onTry={onTryStartAgain}
      />
    </div>
  );
};
