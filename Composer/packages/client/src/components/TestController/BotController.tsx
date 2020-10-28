// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo } from 'react';
import { DefaultButton } from 'office-ui-fabric-react/lib/components/Button';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';

import { buildConfigurationSelector, runningBotsSelector } from '../../recoilModel';

import { BotControllerMenu } from './BotControllerMenu';
import { useLocalBotOperations } from './useLocalBotOperations';
import { BotStatus } from '../../constants';

const BotController: React.FC = () => {
  const runningBots = useRecoilValue(runningBotsSelector);
  const projectCollection = useRecoilValue(buildConfigurationSelector);
  const running = useMemo(() => !projectCollection.every(({ status }) => status === BotStatus.unConnected), [
    projectCollection,
  ]);

  const { startAllBots, stopAllBots } = useLocalBotOperations();

  const handleClick = () => {
    if (!running) {
      startAllBots();
    } else {
      stopAllBots();
    }
  };

  const buttonText = useMemo(() => {
    if (running) {
      return formatMessage('Stop all bots ({running}/{total}) running', {
        running: runningBots.projectIds.length,
        total: runningBots.totalBots,
      });
    }
    return formatMessage('Start all bots');
  }, [runningBots, running]);

  const items = useMemo<IContextualMenuItem[]>(() => {
    return projectCollection.map(({ name: displayName, projectId }) => ({ key: projectId, displayName, projectId }));
  }, [projectCollection]);

  return (
    <DefaultButton
      split
      primary
      aria-roledescription={formatMessage('bot controller')}
      iconProps={{ iconName: running ? 'CircleStopSolid' : 'Play' }}
      menuAs={(props) => <BotControllerMenu {...props} />}
      menuIconProps={{ iconName: 'ProductList' }}
      splitButtonAriaLabel={formatMessage('view bot statuses')}
      styles={{
        root: {
          backgroundColor: '#3393DD',
        },
        splitButtonMenuButton: {
          backgroundColor: '#3393DD',
        },
        splitButtonMenuButtonExpanded: {},
      }}
      menuProps={{ items }}
      onClick={handleClick}
    >
      {buttonText}
    </DefaultButton>
  );
};

export { BotController };
