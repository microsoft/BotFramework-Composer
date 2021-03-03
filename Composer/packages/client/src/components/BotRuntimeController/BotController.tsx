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

import TelemetryClient from '../../telemetry/TelemetryClient';
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

type BotControllerProps = {
  onHideController: (isHidden: boolean) => void;
  isControllerHidden: boolean;
};

const BotController: React.FC<BotControllerProps> = ({ onHideController, isControllerHidden }: BotControllerProps) => {
  const runningBots = useRecoilValue(runningBotsSelector);
  const projectCollection = useRecoilValue(buildConfigurationSelector);
  const errors = useRecoilValue(allDiagnosticsSelectorFamily('Error'));
  const { onboardingAddCoachMarkRef } = useRecoilValue(dispatcherState);
  const onboardRef = useCallback((startBot) => onboardingAddCoachMarkRef({ startBot }), []);
  const [disableStartBots, setDisableOnStartBotsWidget] = useState(false);
  const [isErrorCalloutOpen, setGlobalErrorCalloutVisibility] = useState(false);
  const [statusIconClass, setStatusIconClass] = useState<undefined | string>('Play');
  const [startAllBotsOperationQueued, queueStartAllBots] = useState(false);

  const [botsStartOperationCompleted, setBotsStartOperationCompleted] = useState(false);
  const [areBotsStarting, setBotsStarting] = useState(false);
  const [startPanelButtonText, setStartPanelButtonText] = useState('');
  const { startAllBots, stopAllBots } = useBotOperations();
  const builderEssentials = useRecoilValue(buildConfigurationSelector);
  const rootBotId = useRecoilValue(rootBotProjectIdSelector);

  const startPanelTarget = useRef(null);
  const botControllerMenuTarget = useRef(null);

  useEffect(() => {
    if (runningBots.projectIds.length === 0 && startAllBotsOperationQueued) {
      queueStartAllBots(false);
      startAllBots();
    }
  }, [runningBots, startAllBotsOperationQueued]);

  useEffect(() => {
    if (projectCollection.length === 0 || errors.length) {
      setDisableOnStartBotsWidget(true);
      return;
    }
    setDisableOnStartBotsWidget(false);
  }, [projectCollection, errors]);

  useEffect(() => {
    const botsStarting =
      startAllBotsOperationQueued ||
      projectCollection.some(({ status }) => {
        return (
          status === BotStatus.publishing ||
          status === BotStatus.published ||
          status == BotStatus.pending ||
          status == BotStatus.queued ||
          status == BotStatus.starting ||
          status == BotStatus.stopping
        );
      });
    setBotsStarting(botsStarting);

    const botOperationsCompleted = projectCollection.some(
      ({ status }) => status === BotStatus.connected || status === BotStatus.failed
    );
    setBotsStartOperationCompleted(botOperationsCompleted);

    if (botsStarting) {
      setStatusIconClass(undefined);
      setStartPanelButtonText(
        formatMessage(
          `{
          total, plural,
            =1 {Starting bot..}
          other {Starting bots.. ({running}/{total} running)}
        }`,
          { running: runningBots.projectIds.length, total: runningBots.totalBots }
        )
      );
      return;
    }

    if (botOperationsCompleted && runningBots.projectIds.length) {
      if (statusIconClass !== 'Refresh') {
        onHideController(false);
      }
      setStatusIconClass('Refresh');

      setStartPanelButtonText(
        formatMessage(
          `{
          total, plural,
            =1 {Restart bot}
          other {Restart all bots ({running}/{total} running)}
        }`,
          { running: runningBots.projectIds.length, total: runningBots.totalBots }
        )
      );
      return;
    }

    setStatusIconClass('Play');
    setStartPanelButtonText(
      formatMessage(
        `{
        total, plural,
          =1 {Start bot}
          other {Start all bots}
      }`,
        { total: runningBots.totalBots }
      )
    );
  }, [runningBots, startAllBotsOperationQueued]);

  useClickOutsideOutsideTarget(
    isControllerHidden || isErrorCalloutOpen ? null : [startPanelTarget, botControllerMenuTarget],
    (event: React.MouseEvent<HTMLElement>) => {
      onHideController(true);
      event.stopPropagation();
    }
  );

  const handleClick = async () => {
    if (!botsStartOperationCompleted) {
      TelemetryClient.track('StartAllBotsButtonClicked');
      startAllBots();
    } else {
      queueStartAllBots(true);
      await stopAllBots();
      TelemetryClient.track('RestartAllBotsButtonClicked');
    }
    builderEssentials.forEach(({ projectId }) => {
      TelemetryClient.track('StartBotStarted', { projectId });
    });
  };

  const onSplitButtonClick = () => {
    onHideController(!isControllerHidden);
  };

  const items = useMemo<IContextualMenuItem[]>(() => {
    return projectCollection.map(({ name: displayName, projectId }) => {
      const isRootBot = projectId === rootBotId;
      return {
        key: projectId,
        displayName,
        projectId,
        setGlobalErrorCalloutVisibility,
        isRootBot,
      };
    });
  }, [projectCollection, rootBotId]);

  return (
    <React.Fragment>
      {projectCollection.map(({ projectId }) => {
        return <BotRuntimeStatus key={projectId} projectId={projectId} />;
      })}
      <div ref={botControllerMenuTarget} css={[startPanelsContainer]}>
        <DefaultButton
          primary
          aria-roledescription={formatMessage('Bot Controller')}
          ariaDescription={startPanelButtonText}
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
          title={startPanelButtonText}
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
          <span style={{ margin: '0 0 2px 5px' }}>{startPanelButtonText}</span>
        </DefaultButton>
        <div ref={onboardRef} css={[iconSectionContainer, disableStartBots ? disabledStyle : '']}>
          <IconButton
            ariaDescription={formatMessage('Open start bots panel')}
            data-testid="StartBotsPanel"
            disabled={disableStartBots}
            iconProps={{
              iconName: 'List',
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
