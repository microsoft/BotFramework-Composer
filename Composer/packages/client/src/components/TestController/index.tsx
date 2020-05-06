// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useRef, Fragment, useContext, useEffect, useCallback } from 'react';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';

import { DefaultPublishConfig } from '../../constants';

import settingsStorage from './../../utils/dialogSettingStorage';
import { StoreContext } from './../../store';
import { BotStatus, LuisConfig } from './../../constants';
import { isAbsHosted } from './../../utils/envUtil';
import { getReferredFiles } from './../../utils/luUtil';
import useNotifications from './../../pages/notifications/useNotifications';
import { navigateTo, openInEmulator } from './../../utils';
import { PublishLuisDialog } from './publishDialog';
import { bot, botButton } from './styles';
import { ErrorCallout } from './errorCallout';
import { EmulatorOpenButton } from './emulatorOpenButton';
import { Loading } from './loading';
import { ErrorInfo } from './errorInfo';

export const TestController: React.FC = () => {
  const { state, actions } = useContext(StoreContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [calloutVisible, setCalloutVisible] = useState(false);
  const botActionRef = useRef(null);
  const notifications = useNotifications();
  const { botEndpoints, botName, botStatus, dialogs, luFiles, settings, projectId, botLoadErrorMsg } = state;
  const { publishToTarget, onboardingAddCoachMarkRef, publishLuis, getPublishStatus, setBotStatus } = actions;
  const connected = botStatus === BotStatus.connected;
  const publishing = botStatus === BotStatus.publishing;
  const reloading = botStatus === BotStatus.reloading;
  const addRef = useCallback(startBot => onboardingAddCoachMarkRef({ startBot }), []);
  const errorLength = notifications.filter(n => n.severity === 'Error').length;
  const showError = errorLength > 0;

  useEffect(() => {
    if (projectId) {
      getPublishStatus(projectId, DefaultPublishConfig);
    }
  }, [projectId]);

  useEffect(() => {
    switch (botStatus) {
      case BotStatus.failed:
        openCallout();
        setBotStatus(BotStatus.pending);
        break;
      case BotStatus.published:
        handleLoadBot();
        break;
    }
  }, [botStatus]);

  function dismissDialog() {
    setModalOpen(false);
  }

  function openDialog() {
    setModalOpen(true);
  }

  function dismissCallout() {
    if (calloutVisible) setCalloutVisible(false);
  }

  function openCallout() {
    setCalloutVisible(true);
  }

  async function handlePublishLuis() {
    setBotStatus(BotStatus.publishing);
    dismissDialog();
    const luisConfig = settingsStorage.get(botName) ? settingsStorage.get(botName).luis : null;
    await publishLuis(luisConfig.authoringKey, state.projectId);
  }

  async function handleLoadBot() {
    setBotStatus(BotStatus.reloading);
    const sensitiveSettings = settingsStorage.get(botName);
    await publishToTarget(state.projectId, DefaultPublishConfig, { comment: '' }, sensitiveSettings);
  }

  function isLuisConfigComplete(config) {
    let complete = true;
    for (const key in LuisConfig) {
      if (config && config[LuisConfig[key]] === '') {
        complete = false;
        break;
      }
    }
    return complete;
  }

  async function handleStart() {
    dismissCallout();
    const config = settings.luis;

    if (!isAbsHosted() && getReferredFiles(luFiles, dialogs).length > 0) {
      if (botStatus === BotStatus.failed || botStatus === BotStatus.pending || !isLuisConfigComplete(config)) {
        openDialog();
      } else {
        await handlePublishLuis();
      }
    } else {
      await handleLoadBot();
    }
  }

  function handleErrorButtonClick() {
    navigateTo(`/bot/${state.projectId}/notifications`);
  }

  async function handleOpenEmulator() {
    return Promise.resolve(
      openInEmulator(
        botEndpoints[projectId] || 'http://localhost:3979/api/messages',
        settings.MicrosoftAppId && settings.MicrosoftAppPassword
          ? { MicrosoftAppId: settings.MicrosoftAppId, MicrosoftAppPassword: settings.MicrosoftAppPassword }
          : { MicrosoftAppPassword: '', MicrosoftAppId: '' }
      )
    );
  }

  return (
    <Fragment>
      <div css={bot} ref={botActionRef}>
        <EmulatorOpenButton
          botEndpoint={botEndpoints[projectId] || 'http://localhost:3979/api/messages'}
          botStatus={botStatus}
          hidden={showError}
          onClick={handleOpenEmulator}
        />
        <div
          aria-live={'assertive'}
          aria-label={formatMessage(`{ botStatus}`, {
            botStatus: publishing ? 'Publishing' : reloading ? 'Reloading' : '',
          })}
        />
        <Loading botStatus={botStatus} />
        <div ref={addRef}>
          <ErrorInfo hidden={!showError} onClick={handleErrorButtonClick} count={errorLength} />
          <PrimaryButton
            css={botButton}
            text={connected ? formatMessage('Restart Bot') : formatMessage('Start Bot')}
            onClick={handleStart}
            id={'publishAndConnect'}
            disabled={showError || publishing || reloading}
          />
        </div>
      </div>
      <ErrorCallout
        onDismiss={dismissCallout}
        onTry={handleStart}
        target={botActionRef.current}
        visible={calloutVisible}
        error={botLoadErrorMsg}
      />
      <PublishLuisDialog isOpen={modalOpen} onDismiss={dismissDialog} onPublish={handlePublishLuis} botName={botName} />
    </Fragment>
  );
};
