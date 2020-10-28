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

import { useLocalBotOperations } from './useLocalBotOperations';

interface LocalBotRuntimeProps {
  projectId: string;
  displayName: string;
}

const loadingSpinnerStyle = css`
  margin-right: 12px;
`;

export const LocalBotRuntime: React.FC<LocalBotRuntimeProps> = ({ projectId, displayName }) => {
  const currentBotStatus = useRecoilValue(botStatusState(projectId));
  const { startSingleBot, stopSingleBot } = useLocalBotOperations();

  switch (currentBotStatus) {
    case BotStatus.connected:
      return (
        <IconButton
          styles={{ root: { height: '20px' } }}
          iconProps={{ iconName: 'CircleStopSolid' }}
          aria-label={formatMessage('Stop Bot')}
          onClick={() => stopSingleBot(projectId)}
        />
      );
    case BotStatus.unConnected:
    case BotStatus.failed:
      return (
        <IconButton
          styles={{ root: { height: '20px' } }}
          iconProps={{ iconName: 'Play' }}
          aria-label={formatMessage('Start Bot')}
          onClick={() => startSingleBot(projectId)}
        />
      );
    default:
      return <Spinner css={loadingSpinnerStyle} />;
  }
};
