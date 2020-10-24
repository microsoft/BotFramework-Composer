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
import {
  botEndpointsState,
  botRuntimeErrorState,
  botRuntimeOperationsSelector,
  botStatusState,
  dispatcherState,
} from '../../recoilModel';
import { useInterval } from '../../utils/hooks';

import { EmulatorOpenButton } from './emulatorOpenButton';
import { ErrorCallout } from './errorCallout';
import { useLocalBotOperations } from './useLocalBotOperations';

const actionButton = css`
  color: #0078d4;
`;

const botStatusContainer = css`
  display: flex;
  align-items: center;
`;

const pollingInterval = 3000;

interface LocalBotStatusIndicatorProps {
  projectId: string;
}

export const LocalBotStatusIndicator: React.FC<LocalBotStatusIndicatorProps> = ({ projectId }) => {
  const currentBotStatus = useRecoilValue(botStatusState(projectId));
  const botEndpoints = useRecoilValue(botEndpointsState);
  const { openBotInEmulator, getPublishStatus } = useRecoilValue(dispatcherState);
  const [botStatusText, setBotStatusText] = useState('');
  const [isRunning, setIntervalRunning] = useState(false);
  const botActionRef = useRef(null);
  const botLoadErrorMsg = useRecoilValue(botRuntimeErrorState(projectId));
  const [calloutVisible, setErrorCallout] = useState(false);
  const { startSingleBot, stopSingleBot } = useLocalBotOperations();

  useInterval(
    () => {
      getPublishStatus(projectId, defaultPublishConfig);
    },
    isRunning ? pollingInterval : null
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
        setBotStatusText(BotStatusesCopy.failed);
        setIntervalRunning(false);
        stopSingleBot(projectId);
        break;
      case BotStatus.published:
        setBotStatusText(BotStatusesCopy.published);
        setIntervalRunning(false);
        startSingleBot(projectId, true);
        break;
      case BotStatus.reloading:
        setBotStatusText(BotStatusesCopy.loading);
        setIntervalRunning(true);
        break;

      case BotStatus.connected: {
        setBotStatusText(BotStatusesCopy.connected);
        if (isRunning) {
          setTimeout(() => {
            getPublishStatus(projectId, defaultPublishConfig);
          }, pollingInterval);
        }
        setIntervalRunning(false);
        break;
      }
      case BotStatus.publishing:
        setBotStatusText(BotStatusesCopy.publishing);
        break;

      default:
      case BotStatus.unConnected:
        setBotStatusText(BotStatusesCopy.unConnected);
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
