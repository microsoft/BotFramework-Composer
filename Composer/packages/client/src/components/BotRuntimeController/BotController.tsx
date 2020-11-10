// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { DefaultButton, IconButton } from 'office-ui-fabric-react/lib/Button';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';
import { css } from '@emotion/core';
import { NeutralColors } from '@uifabric/fluent-theme';

import { buildConfigurationSelector, dispatcherState, runningBotsSelector } from '../../recoilModel';
import { BotStatus } from '../../constants';
import { useClickOutside } from '../../utils/hooks';

import { BotControllerMenu } from './BotControllerMenu';
import { useBotOperations } from './useBotOperations';
import { BotRuntimeStatus } from './BotRuntimeStatus';

const iconSectionContainer = css`
  display: flex;
  align-items: flex-end;
  flex-direction: 'row';

  :before {
    content: '';
    position: relative;
    margin: auto 0px;
    width: 1px;
    background: ${NeutralColors.white};
    height: 21px;
  }
`;

const startPanelsContainer = css`
  display: flex;
  flex-direction: 'row';
`;

const transparentBackground = 'rgba(255, 255, 255, 0.5)';

const BotController: React.FC = () => {
  const runningBots = useRecoilValue(runningBotsSelector);
  const projectCollection = useRecoilValue(buildConfigurationSelector);
  const [isControllerHidden, setControllerVisibility] = useState(true);
  const { onboardingAddCoachMarkRef } = useRecoilValue(dispatcherState);
  const onboardRef = useCallback((startBot) => onboardingAddCoachMarkRef({ startBot }), []);

  const target = useRef(null);
  const botControllerMenuTarget = useRef(null);

  useClickOutside(botControllerMenuTarget, () => {
    setControllerVisibility(true);
  });

  const running = useMemo(() => !projectCollection.every(({ status }) => status === BotStatus.unConnected), [
    projectCollection,
  ]);

  const { startAllBots, stopAllBots } = useBotOperations();

  const handleClick = () => {
    if (!running) {
      startAllBots();
    } else {
      stopAllBots();
    }
  };

  const onSplitButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setControllerVisibility(!isControllerHidden);
    event.stopPropagation();
  };

  const buttonText = useMemo(() => {
    if (running) {
      return formatMessage('Stop all bots ({running}/{total} running)', {
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
    <React.Fragment>
      {projectCollection.map(({ projectId }) => {
        return <BotRuntimeStatus key={projectId} projectId={projectId} />;
      })}
      <div ref={target} css={startPanelsContainer}>
        <DefaultButton
          primary
          aria-roledescription={formatMessage('bot controller')}
          iconProps={{ iconName: running ? 'CircleStopSolid' : 'Play' }}
          menuAs={() => null}
          styles={{
            root: {
              backgroundColor: '#3393DD',
              display: 'flex',
              alignItems: 'center',
              minWidth: '200px',
              flexDirection: 'row',
            },
            rootHovered: {
              background: transparentBackground,
            },
          }}
          onClick={handleClick}
        >
          <span>{buttonText}</span>
        </DefaultButton>
        <div ref={onboardRef} css={iconSectionContainer}>
          <IconButton
            ariaDescription={formatMessage('Open start bots panel')}
            iconProps={{
              iconName: 'ProductList',
            }}
            styles={{
              root: {
                color: NeutralColors.white,
                background: isControllerHidden ? '#3393DD' : transparentBackground,
              },
              rootHovered: { background: transparentBackground, color: NeutralColors.white },
            }}
            title={formatMessage('Open start bots panel')}
            onClick={onSplitButtonClick}
          />
        </div>
      </div>
      <BotControllerMenu ref={botControllerMenuTarget} hidden={isControllerHidden} items={items} target={target} />
    </React.Fragment>
  );
};

export { BotController };
