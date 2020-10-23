// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import { FontSizes, SharedColors } from '@uifabric/fluent-theme';
import { ActionButton, IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import { useCallback } from 'react';

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

const icon: IButtonStyles = {
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

  const botRunIndicatorCallback = useCallback(() => {
    switch (currentBotStatus) {
      case BotStatus.connected:
        return (
          <ActionButton onClick={() => stopSingleBot(projectId)}>
            <Icon iconName={'CircleStopSolid'} styles={icon} />
          </ActionButton>
        );
      case BotStatus.unConnected:
      case BotStatus.failed:
        return (
          <ActionButton onClick={() => startSingleBot(projectId)}>
            <Icon iconName={'Play'} styles={icon} />
          </ActionButton>
        );
      default:
        return <Spinner css={loadingSpinnerStyle} />;
    }
  }, [currentBotStatus]);

  return (
    <div css={localBotRuntimeContainerStyles}>
      {botRunIndicatorCallback()}
      <span aria-label={displayName}>{displayName}</span>
    </div>
  );
};
