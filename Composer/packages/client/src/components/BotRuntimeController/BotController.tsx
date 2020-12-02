// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DefaultButton, IconButton } from 'office-ui-fabric-react/lib/Button';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';
import { css } from '@emotion/core';
import { NeutralColors } from '@uifabric/fluent-theme';

import {
  buildConfigurationSelector,
  dispatcherState,
  runningBotsSelector,
  allDiagnosticsSelectorFamily,
} from '../../recoilModel';
import { BotStatus } from '../../constants';
import { useClickOutsideOutsideTarget } from '../../utils/hooks';

import { BotControllerMenu } from './BotControllerMenu';
import { useBotOperations } from './useBotOperations';
import { BotRuntimeStatus } from './BotRuntimeStatus';

const iconSectionContainer = css`
  display: flex;
  align-items: flex-end;
  flex-direction: row;
  background: #3393dd;

  :before {
    content: '';
    position: relative;
    margin: auto 0px;
    width: 1px;
    background: ${NeutralColors.white};
    height: 21px;
  }
`;

const disabledStyle = css`
  &:before {
    opacity: 0.6;
  }
  pointer-events: none;
`;

const startPanelsContainer = css`
  display: flex;
  flex-direction: 'row';
`;

const transparentBackground = 'rgba(255, 255, 255, 0.5)';

const BotController: React.FC = () => {
  const runningBots = useRecoilValue(runningBotsSelector);
  const projectCollection = useRecoilValue(buildConfigurationSelector);
  const errors = useRecoilValue(allDiagnosticsSelectorFamily('Error'));
  const [isControllerHidden, hideController] = useState(true);
  const { onboardingAddCoachMarkRef } = useRecoilValue(dispatcherState);
  const onboardRef = useCallback((startBot) => onboardingAddCoachMarkRef({ startBot }), []);
  const [disableStartBots, setDisableOnStartBotsWidget] = useState(false);
  const [isErrorCalloutOpen, setGlobalErrorCalloutVisibility] = useState(false);

  const startPanelTarget = useRef(null);
  const botControllerMenuTarget = useRef(null);

  useClickOutsideOutsideTarget(
    isControllerHidden || isErrorCalloutOpen ? null : [startPanelTarget, botControllerMenuTarget],
    (event: React.MouseEvent<HTMLElement>) => {
      hideController(true);
      event.stopPropagation();
    }
  );

  useEffect(() => {
    if (projectCollection.length === 0 || errors.length) {
      setDisableOnStartBotsWidget(true);
      return;
    }
    setDisableOnStartBotsWidget(false);
  }, [projectCollection, errors]);

  const running = useMemo(
    () => !projectCollection.every(({ status }) => status === BotStatus.inactive || status === BotStatus.failed),
    [projectCollection]
  );

  const { startAllBots, stopAllBots } = useBotOperations();

  const handleClick = () => {
    if (!running) {
      startAllBots();
    } else {
      stopAllBots();
    }
  };

  const onSplitButtonClick = () => {
    hideController(!isControllerHidden);
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
    return projectCollection.map(({ name: displayName, projectId }) => ({
      key: projectId,
      displayName,
      projectId,
      setGlobalErrorCalloutVisibility,
    }));
  }, [projectCollection]);

  return (
    <React.Fragment>
      {projectCollection.map(({ projectId }) => {
        return <BotRuntimeStatus key={projectId} projectId={projectId} />;
      })}
      <div ref={botControllerMenuTarget} css={[startPanelsContainer]}>
        <DefaultButton
          primary
          aria-roledescription={formatMessage('Bot Controller')}
          ariaDescription={buttonText}
          disabled={disableStartBots}
          iconProps={{
            iconName: running ? 'CircleStopSolid' : 'Play',
            styles: {
              root: {
                color: `${NeutralColors.white}`,
              },
            },
          }}
          menuAs={() => null}
          styles={{
            root: {
              backgroundColor: '#3393dd',
              display: 'flex',
              alignItems: 'center',
              minWidth: '212px',
              height: '36px',
              flexDirection: 'row',
              padding: '0 4px',
              border: 'none',
              width: '100%',
            },
            rootHovered: {
              background: transparentBackground,
            },
            rootDisabled: {
              opacity: 0.6,
              backgroundColor: '#3393dd',
              color: `${NeutralColors.white}`,
              border: 'none',
              font: '62px',
            },
          }}
          title={buttonText}
          onClick={handleClick}
        >
          {buttonText}
        </DefaultButton>
        <div ref={onboardRef} css={[iconSectionContainer, disableStartBots ? disabledStyle : '']}>
          <IconButton
            ariaDescription={formatMessage('Open start bots panel')}
            disabled={disableStartBots}
            iconProps={{
              iconName: 'ProductList',
            }}
            styles={{
              root: {
                color: NeutralColors.white,
                height: '36px',
                background: isControllerHidden ? '#3393DD' : transparentBackground,
                selectors: {
                  ':disabled .ms-Button-icon': {
                    opacity: 0.6,
                    backgroundColor: '#3393DD',
                    color: `${NeutralColors.white}`,
                  },
                },
              },
              rootHovered: { background: transparentBackground, color: NeutralColors.white },
            }}
            title={formatMessage('Open start bots panel')}
            onClick={onSplitButtonClick}
          />
        </div>
      </div>
      <BotControllerMenu
        ref={startPanelTarget}
        hidden={isControllerHidden}
        items={items}
        target={botControllerMenuTarget}
      />
    </React.Fragment>
  );
};

export { BotController };
