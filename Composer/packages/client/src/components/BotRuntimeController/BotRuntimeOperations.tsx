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

import { useBotOperations } from './useBotOperations';

interface BotRuntimeOperationsProps {
  projectId: string;
}

const loadingSpinnerStyle = css`
  margin-left: 8px;
`;

export const BotRuntimeOperations: React.FC<BotRuntimeOperationsProps> = ({ projectId }) => {
  const currentBotStatus = useRecoilValue(botStatusState(projectId));
  const { startSingleBot, stopSingleBot } = useBotOperations();

  switch (currentBotStatus) {
    case BotStatus.connected:
      return (
        <IconButton
          aria-label={formatMessage('Stop Bot')}
          iconProps={{ iconName: 'CircleStopSolid' }}
          styles={{ root: { height: '20px' } }}
          title={formatMessage('Stop Bot')}
          onClick={() => stopSingleBot(projectId)}
        />
      );
    case BotStatus.inactive:
    case BotStatus.failed:
      return (
        <IconButton
          aria-label={formatMessage('Start Bot')}
          iconProps={{ iconName: 'Play' }}
          styles={{ root: { height: '20px' } }}
          title={formatMessage('Start Bot')}
          onClick={() => startSingleBot(projectId)}
        />
      );
    default:
      return <Spinner css={loadingSpinnerStyle} />;
  }
};
