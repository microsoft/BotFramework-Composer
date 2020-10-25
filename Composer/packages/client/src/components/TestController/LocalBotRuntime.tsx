// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import { FontSizes, SharedColors } from '@uifabric/fluent-theme';
import { ActionButton, IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import { useMemo } from 'react';
import formatMessage from 'format-message';

import { botStatusState } from '../../recoilModel';
import { BotStatus } from '../../constants';

import { useLocalBotOperations } from './useLocalBotOperations';

interface LocalBotRuntimeProps {
  projectId: string;
  displayName: string;
}

const localBotRuntimeContainerStyles = css`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const loadingSpinnerStyle = css`
  margin-right: 12px;
`;

const botStatusIcon: IButtonStyles = {
  root: {
    color: `${SharedColors.cyanBlue20}`,
    marginRight: '12px',
    boxSizing: 'border-box',
    fontSize: `${FontSizes.size16}`,
    width: '20px',
  },
};

export const LocalBotRuntime: React.FC<LocalBotRuntimeProps> = ({ projectId, displayName }) => {
  const currentBotStatus = useRecoilValue(botStatusState(projectId));
  const { startSingleBot, stopSingleBot } = useLocalBotOperations();

  const botRunningIndicator = useMemo(() => {
    switch (currentBotStatus) {
      case BotStatus.connected:
        return (
          <ActionButton aria-label={formatMessage('Stop Bot')} onClick={() => stopSingleBot(projectId)}>
            <Icon iconName={'CircleStopSolid'} styles={botStatusIcon} />
          </ActionButton>
        );
      case BotStatus.unConnected:
      case BotStatus.failed:
        return (
          <ActionButton aria-label={formatMessage('Start Bot')} onClick={() => startSingleBot(projectId)}>
            <Icon iconName={'Play'} styles={botStatusIcon} />
          </ActionButton>
        );
      default:
        return <Spinner css={loadingSpinnerStyle} />;
    }
  }, [currentBotStatus]);

  return (
    <div css={localBotRuntimeContainerStyles}>
      {botRunningIndicator}
      <span aria-label={displayName}>{displayName}</span>
    </div>
  );
};
