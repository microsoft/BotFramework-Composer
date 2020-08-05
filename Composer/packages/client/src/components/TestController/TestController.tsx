// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */

import React, { useState, useRef, Fragment, useEffect, useCallback } from 'react';
import { jsx, css } from '@emotion/core';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';
import { useRecoilValue } from 'recoil';

import { DefaultPublishConfig } from '../../constants';
import {
  botNameState,
  botStatusState,
  luFilesState,
  settingsState,
  projectIdState,
  botLoadErrorState,
  botEndpointsState,
  dispatcherState,
} from '../../recoilModel';
import settingsStorage from '../../utils/dialogSettingStorage';
import { BotStatus, LuisConfig } from '../../constants';
import { isAbsHosted } from '../../utils/envUtil';
import useNotifications from '../../pages/notifications/useNotifications';
import { navigateTo, openInEmulator } from '../../utils/navigation';
import { validatedDialogsSelector } from '../../recoilModel/selectors/validatedDialogs';

import { getReferredFiles } from './../../utils/luUtil';
import { PublishLuisDialog } from './publishDialog';
import { ErrorCallout } from './errorCallout';
import { EmulatorOpenButton } from './emulatorOpenButton';
import { Loading } from './loading';
import { ErrorInfo } from './errorInfo';
import { WarningInfo } from './warningInfo';

// -------------------- Styles -------------------- //

export const bot = css`
  display: flex;
  align-items: center;
  position: relative;
  height: 100%;
`;

export const botButton = css`
  margin-left: 5px;
`;

// -------------------- TestController -------------------- //

export const TestController: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [calloutVisible, setCalloutVisible] = useState(false);
  const botActionRef = useRef(null);
  const notifications = useNotifications();
  const botName = useRecoilValue(botNameState);
  const botStatus = useRecoilValue(botStatusState);
  const dialogs = useRecoilValue(validatedDialogsSelector);
  const luFiles = useRecoilValue(luFilesState);
  const settings = useRecoilValue(settingsState);
  const projectId = useRecoilValue(projectIdState);
  const botLoadErrorMsg = useRecoilValue(botLoadErrorState);
  const botEndpoints = useRecoilValue(botEndpointsState);
  const {
    publishToTarget,
    onboardingAddCoachMarkRef,
    publishLuis,
    getPublishStatus,
    setBotStatus,
    setSettings,
  } = useRecoilValue(dispatcherState);
  const connected = botStatus === BotStatus.connected;
  const publishing = botStatus === BotStatus.publishing;
  const reloading = botStatus === BotStatus.reloading;
  const addRef = useCallback((startBot) => onboardingAddCoachMarkRef({ startBot }), []);
  const errorLength = notifications.filter((n) => n.severity === 'Error').length;
  const showError = errorLength > 0;
  const warningLength = notifications.filter((n) => n.severity === 'Warning').length;
  const showWarning = !showError && warningLength > 0;

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

  async function handlePublishLuis(luisConfig) {
    setBotStatus(BotStatus.publishing);
    dismissDialog();
    await setSettings(projectId, { ...settings, luis: luisConfig });
    await publishLuis(luisConfig, projectId);
  }

  async function handleLoadBot() {
    setBotStatus(BotStatus.reloading);
    const sensitiveSettings = settingsStorage.get(projectId);
    await publishToTarget(projectId, DefaultPublishConfig, { comment: '' }, sensitiveSettings);
  }

  function isLuisConfigComplete(config) {
    let complete = true;
    for (const key in LuisConfig) {
      if (config?.[LuisConfig[key]] === '') {
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
        await handlePublishLuis(config);
      }
    } else {
      await handleLoadBot();
    }
  }

  function handleErrorButtonClick() {
    navigateTo(`/bot/${projectId}/notifications`);
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
      <div ref={botActionRef} css={bot}>
        <EmulatorOpenButton
          botEndpoint={botEndpoints[projectId] || 'http://localhost:3979/api/messages'}
          botStatus={botStatus}
          hidden={showError}
          onClick={handleOpenEmulator}
        />
        <div
          aria-label={publishing ? formatMessage('Publishing') : reloading ? formatMessage('Reloading') : ''}
          aria-live={'assertive'}
        />
        <Loading botStatus={botStatus} />
        <div ref={addRef}>
          <ErrorInfo count={errorLength} hidden={!showError} onClick={handleErrorButtonClick} />
          <WarningInfo count={warningLength} hidden={!showWarning} onClick={handleErrorButtonClick} />
          <PrimaryButton
            css={botButton}
            disabled={showError || publishing || reloading}
            id={'publishAndConnect'}
            text={connected ? formatMessage('Restart Bot') : formatMessage('Start Bot')}
            onClick={handleStart}
          />
        </div>
      </div>
      <ErrorCallout
        error={botLoadErrorMsg}
        target={botActionRef.current}
        visible={calloutVisible}
        onDismiss={dismissCallout}
        onTry={handleStart}
      />
      {settings.luis && (
        <PublishLuisDialog
          botName={botName}
          config={settings.luis}
          isOpen={modalOpen}
          onDismiss={dismissDialog}
          onPublish={handlePublishLuis}
        />
      )}
    </Fragment>
  );
};
