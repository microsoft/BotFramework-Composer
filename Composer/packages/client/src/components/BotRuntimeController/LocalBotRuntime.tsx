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
}

const loadingSpinnerStyle = css`
  margin-left: 8px;
`;

export const LocalBotRuntime: React.FC<LocalBotRuntimeProps> = ({ projectId }) => {
  const currentBotStatus = useRecoilValue(botStatusState(projectId));
  const { startSingleBot, stopSingleBot } = useLocalBotOperations();

  switch (currentBotStatus) {
    case BotStatus.connected:
      return (
        <IconButton
          aria-label={formatMessage('Stop Bot')}
          iconProps={{ iconName: 'CircleStopSolid' }}
          styles={{ root: { height: '20px' } }}
          onClick={() => stopSingleBot(projectId)}
        />
      );
    case BotStatus.unConnected:
    case BotStatus.failed:
      return (
        <IconButton
          aria-label={formatMessage('Start Bot')}
          iconProps={{ iconName: 'Play' }}
          styles={{ root: { height: '20px' } }}
          onClick={() => startSingleBot(projectId)}
        />
      );
    default:
      return <Spinner css={loadingSpinnerStyle} />;
  }
};
