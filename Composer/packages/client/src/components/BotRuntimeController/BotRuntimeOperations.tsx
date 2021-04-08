// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import formatMessage from 'format-message';

import { botStatusState } from '../../recoilModel';
import { BotStatus } from '../../constants';
import TelemetryClient from '../../telemetry/TelemetryClient';

import { useBotOperations } from './useBotOperations';

interface BotRuntimeOperationsProps {
  projectId: string;
  isRoot: boolean;
}

const loadingSpinnerStyle = css`
  margin-left: 8px;
`;

export const BotRuntimeOperations: React.FC<BotRuntimeOperationsProps> = ({ projectId, isRoot }) => {
  const currentBotStatus = useRecoilValue(botStatusState(projectId));
  const { startSingleBot, stopSingleBot } = useBotOperations();

  switch (currentBotStatus) {
    case BotStatus.connected:
      return (
        <IconButton
          aria-label={formatMessage('Stop bot')}
          iconProps={{ iconName: 'CircleStopSolid' }}
          styles={{ root: { height: '20px' } }}
          title={formatMessage('Stop bot')}
          onClick={() => {
            stopSingleBot(projectId);
            TelemetryClient.track('StopBotButtonClicked', { isRoot, projectId, location: 'botController' });
          }}
        />
      );
    case BotStatus.inactive:
    case BotStatus.failed:
      return (
        <IconButton
          aria-label={formatMessage('Start bot')}
          iconProps={{ iconName: 'Play' }}
          styles={{ root: { height: '20px' } }}
          title={formatMessage('Start bot')}
          onClick={() => {
            startSingleBot(projectId);
            TelemetryClient.track('StartBotButtonClicked', { isRoot, projectId, location: 'botController' });
          }}
        />
      );
    default:
      return <Spinner css={loadingSpinnerStyle} />;
  }
};
