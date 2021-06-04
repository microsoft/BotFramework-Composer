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
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';

import { DisableFeatureToolTip } from '../DisableFeatureToolTip';
import TelemetryClient from '../../telemetry/TelemetryClient';
import {
  buildConfigurationSelector,
  dispatcherState,
  runningBotsSelector,
  allDiagnosticsSelectorFamily,
  rootBotProjectIdSelector,
} from '../../recoilModel';
import { BotStatus } from '../../constants';
import { colors } from '../../colors';
import { useClickOutsideOutsideTarget } from '../../utils/hooks';
import { usePVACheck } from '../../hooks/usePVACheck';

import { BotControllerMenu } from './BotControllerMenu';
import { useBotOperations } from './useBotOperations';
import { BotRuntimeStatus } from './BotRuntimeStatus';

const iconSectionContainer = css`
  display: flex;
  align-items: flex-end;
  flex-direction: row;
  background: ${colors.botControllerBg};

  :before {
    content: '';
    position: relative;
    margin: auto 0px;
    width: 1px;
    background: ${colors.bg};
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

const transparentBackground = colors.transparentBg;

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
  const [statusIconClass, setStatusIconClass] = useState<undefined | string>('Play');
  const [startAllBotsOperationQueued, queueStartAllBots] = useState(false);

  const [botsStartOperationCompleted, setBotsStartOperationCompleted] = useState(false);
  const [areBotsProcessing, setBotsProcessing] = useState(false);
  const [startPanelButtonText, setStartPanelButtonText] = useState('');
  const { startAllBots, stopAllBots } = useBotOperations();
  const builderEssentials = useRecoilValue(buildConfigurationSelector);
  const rootBotId = useRecoilValue(rootBotProjectIdSelector);
  const isPVABot = usePVACheck(rootBotId ?? '');

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
    const botsProcessing =
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
    setBotsProcessing(botsProcessing);

    const botOperationsCompleted = projectCollection.some(
      ({ status }) => status === BotStatus.connected || status === BotStatus.failed
    );
    setBotsStartOperationCompleted(botOperationsCompleted);

    if (botsProcessing) {
      setStatusIconClass(undefined);
      const botsStopping = projectCollection.some(({ status }) => status == BotStatus.stopping);
      if (botsStopping) {
        setStartPanelButtonText(
          formatMessage(
            `{
            total, plural,
              =1 {Stopping bot..}
            other {Stopping bots.. ({running}/{total} running)}
          }`,
            { running: runningBots.projectIds.length, total: runningBots.totalBots }
          )
        );
      } else {
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
      }
      return;
    }

    if (botOperationsCompleted) {
      if (statusIconClass !== 'Refresh') {
        onHideController(false);
      }

      if (runningBots.projectIds.length) {
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
    }

    setStatusIconClass('Play');
    setStartPanelButtonText(
      formatMessage(
        `{
        total, plural,
          =1 {Start bot}
          other {Start all}
      }`,
        { total: runningBots.totalBots }
      )
    );
  }, [runningBots, startAllBotsOperationQueued]);

  useClickOutsideOutsideTarget(
    isControllerHidden ? null : [startPanelTarget, botControllerMenuTarget],
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
        <DisableFeatureToolTip
          content={formatMessage(
            'Power Virtual Agents bots cannot be run at the moment. Publish the bot to Power Virtual Agents and test it there.'
          )}
          isPVABot={isPVABot}
        >
          <DefaultButton
            primary
            aria-roledescription={formatMessage('Bot Controller')}
            ariaDescription={startPanelButtonText}
            data-testid={'startBotButton'}
            disabled={disableStartBots || areBotsProcessing}
            iconProps={{
              iconName: statusIconClass,
              styles: {
                root: {
                  color: colors.textOnColor,
                },
              },
            }}
            id={'startBotPanelElement'}
            menuAs={() => null}
            styles={{
              root: {
                backgroundColor: colors.main,
                display: 'flex',
                alignItems: 'center',
                minWidth: '229px',
                height: '36px',
                flexDirection: 'row',
                padding: '0 7px',
                border: `1px solid ${colors.main}`,
                width: '100%',
              },
              rootHovered: {
                background: transparentBackground,
              },
              rootDisabled: {
                opacity: 0.6,
                backgroundColor: colors.main,
                color: colors.textOnColor,
                border: 'none',
                font: '62px',
              },
            }}
            title={startPanelButtonText}
            onClick={handleClick}
          >
            {areBotsProcessing && (
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
        </DisableFeatureToolTip>
        <div ref={onboardRef} css={[iconSectionContainer, disableStartBots ? disabledStyle : '']}>
          <IconButton
            ariaDescription={formatMessage('Start and stop local bot runtimes')}
            data-testid="StartBotsPanel"
            disabled={disableStartBots}
            iconProps={{
              iconName: 'List',
            }}
            styles={{
              root: {
                color: colors.bg,
                height: '36px',
                background: isControllerHidden ? colors.botControllerBg : transparentBackground,
                selectors: {
                  ':disabled .ms-Button-icon': {
                    opacity: 0.6,
                    backgroundColor: colors.botControllerBg,
                    color: colors.textOnColor,
                  },
                },
              },
              rootHovered: { background: transparentBackground, color: colors.textOnColor },
            }}
            title={formatMessage('Start and stop local bot runtimes')}
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
