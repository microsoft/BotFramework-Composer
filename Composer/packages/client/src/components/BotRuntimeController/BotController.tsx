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
import { NeutralColors, CommunicationColors } from '@uifabric/fluent-theme';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';

import {
  buildConfigurationSelector,
  dispatcherState,
  runningBotsSelector,
  allDiagnosticsSelectorFamily,
  rootBotProjectIdSelector,
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
  background: ${CommunicationColors.tint10};

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
  const [statusIconClass, setStatusIconClass] = useState<undefined | string>('Play');
  const [startAllOperationQueued, queueStartAllBots] = useState(false);
  const rootBotId = useRecoilValue(rootBotProjectIdSelector);

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

  const botStartComplete = useMemo(() => projectCollection.find(({ status }) => status === BotStatus.connected), [
    projectCollection,
  ]);

  const areBotsStarting = useMemo(
    () =>
      !!projectCollection.find(({ status }) => {
        return (
          status === BotStatus.publishing ||
          status === BotStatus.published ||
          status == BotStatus.pending ||
          status == BotStatus.queued ||
          status == BotStatus.reloading
        );
      }),
    [projectCollection]
  );

  const { startAllBots, stopAllBots } = useBotOperations();

  const handleClick = async () => {
    if (!botStartComplete) {
      startAllBots();
    } else {
      await stopAllBots();
      queueStartAllBots(true);
    }
  };

  const onSplitButtonClick = () => {
    hideController(!isControllerHidden);
  };

  const buttonText = useMemo(() => {
    if (areBotsStarting) {
      setStatusIconClass(undefined);
      return formatMessage('Starting bots.. ({running}/{total} running)', {
        running: runningBots.projectIds.length,
        total: runningBots.totalBots,
      });
    }

    if (botStartComplete) {
      if (statusIconClass !== 'Refresh') {
        hideController(false);
      }
      setStatusIconClass('Refresh');
      return formatMessage('Restart all bots ({running}/{total} running)', {
        running: runningBots.projectIds.length,
        total: runningBots.totalBots,
      });
    }
    if (startAllOperationQueued) {
      queueStartAllBots(false);
      startAllBots();
    }
    setStatusIconClass('Play');
    return formatMessage('Start all bots');
  }, [runningBots, botStartComplete, areBotsStarting]);

  const items = useMemo<IContextualMenuItem[]>(() => {
    return projectCollection.map(({ name: displayName, projectId }) => ({
      key: projectId,
      displayName,
      projectId,
      setGlobalErrorCalloutVisibility,
      isRootBot: projectId === rootBotId,
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
          disabled={disableStartBots || areBotsStarting}
          iconProps={{
            iconName: statusIconClass,
            styles: {
              root: {
                color: `${NeutralColors.white}`,
              },
            },
          }}
          menuAs={() => null}
          styles={{
            root: {
              backgroundColor: CommunicationColors.tint10,
              display: 'flex',
              alignItems: 'center',
              minWidth: '229px',
              height: '36px',
              flexDirection: 'row',
              padding: '0 7px',
              border: `1px solid ${CommunicationColors.tint10}`,
              width: '100%',
            },
            rootHovered: {
              background: transparentBackground,
            },
            rootDisabled: {
              opacity: 0.6,
              backgroundColor: CommunicationColors.tint10,
              color: `${NeutralColors.white}`,
              border: 'none',
              font: '62px',
            },
          }}
          title={buttonText}
          onClick={handleClick}
        >
          {areBotsStarting && (
            <Spinner
              size={SpinnerSize.small}
              styles={{
                root: {
                  marginRight: '5px',
                },
              }}
            />
          )}
          <span style={{ margin: '0 0 2px 5px' }}>{buttonText}</span>
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
                background: isControllerHidden ? CommunicationColors.tint10 : transparentBackground,
                selectors: {
                  ':disabled .ms-Button-icon': {
                    opacity: 0.6,
                    backgroundColor: CommunicationColors.tint10,
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
