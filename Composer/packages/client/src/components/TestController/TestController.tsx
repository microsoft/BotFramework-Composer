// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useState, useRef, Fragment, useContext, useEffect, useCallback } from 'react';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';

import { DefaultPublishConfig, QnaConfig, BotStatus, LuisConfig } from '../../constants';
import { isAbsHosted } from '../../utils/envUtil';
import useNotifications from '../../pages/notifications/useNotifications';
import { navigateTo, openInEmulator } from '../../utils/navigation';

import settingsStorage from './../../utils/dialogSettingStorage';
import { StoreContext } from './../../store';
import { getReferredLuFiles } from './../../utils/luUtil';
import { getReferredQnaFiles } from './../../utils/qnaUtil';
import { PublishLuisDialog } from './publishDialog';
import { ErrorCallout } from './errorCallout';
import { EmulatorOpenButton } from './emulatorOpenButton';
import { Loading } from './loading';
import { ErrorInfo } from './errorInfo';

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
  const { state, actions } = useContext(StoreContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [calloutVisible, setCalloutVisible] = useState(false);
  const botActionRef = useRef(null);
  const notifications = useNotifications();
  const { botEndpoints, botName, botStatus, dialogs, luFiles, qnaFiles, settings, projectId, botLoadErrorMsg } = state;
  const { publishToTarget, onboardingAddCoachMarkRef, build, getPublishStatus, setBotStatus } = actions;
  const connected = botStatus === BotStatus.connected;
  const publishing = botStatus === BotStatus.publishing;
  const reloading = botStatus === BotStatus.reloading;
  const addRef = useCallback((startBot) => onboardingAddCoachMarkRef({ startBot }), []);
  const errorLength = notifications.filter((n) => n.severity === 'Error').length;
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

  async function handlePublish() {
    setBotStatus(BotStatus.publishing);
    dismissDialog();
    const luisConfig = settingsStorage.get(projectId) ? settingsStorage.get(projectId).luis || {} : {};
    const qnaConfig = settingsStorage.get(projectId) ? settingsStorage.get(projectId).qna || {} : {};
    await build(luisConfig.authoringKey, qnaConfig.subscriptionKey, state.projectId);
  }

  async function handleLoadBot() {
    setBotStatus(BotStatus.reloading);
    const sensitiveSettings = settingsStorage.get(projectId);
    await publishToTarget(state.projectId, DefaultPublishConfig, { comment: '' }, sensitiveSettings);
  }

  function isConfigComplete(config) {
    let complete = true;
    if (getReferredLuFiles(luFiles, dialogs).length > 0) {
      for (const key in LuisConfig) {
        if (config?.[LuisConfig[key]] === '') {
          complete = false;
          break;
        }
      }
    }
    if (getReferredQnaFiles(qnaFiles, dialogs).length > 0) {
      for (const key in QnaConfig) {
        if (config?.[QnaConfig[key]] === '') {
          complete = false;
          break;
        }
      }
    }
    return complete;
  }

  async function handleStart() {
    dismissCallout();
    const config = Object.assign({}, settings.luis, settings.qna);
    if (!isAbsHosted()) {
      if (botStatus === BotStatus.failed || botStatus === BotStatus.pending || !isConfigComplete(config)) {
        openDialog();
      } else {
        await handlePublish();
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
      <PublishLuisDialog botName={botName} isOpen={modalOpen} onDismiss={dismissDialog} onPublish={handlePublish} />
    </Fragment>
  );
};
