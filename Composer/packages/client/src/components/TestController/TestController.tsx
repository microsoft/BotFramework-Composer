// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */

import React, { useState, useRef, Fragment, useEffect, useCallback } from 'react';
import { jsx, css } from '@emotion/core';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';
import { useRecoilValue } from 'recoil';
import { IConfig, IPublishConfig } from '@bfc/shared';

import {
  botNameState,
  botStatusState,
  luFilesState,
  qnaFilesState,
  settingsState,
  projectIdState,
  botLoadErrorState,
  botEndpointsState,
  dispatcherState,
} from '../../recoilModel';
import settingsStorage from '../../utils/dialogSettingStorage';
import { DefaultPublishConfig, QnaConfig, BotStatus, LuisConfig } from '../../constants';
import { isAbsHosted } from '../../utils/envUtil';
import useNotifications from '../../pages/notifications/useNotifications';
import { navigateTo, openInEmulator } from '../../utils/navigation';
import { getReferredQnaFiles } from '../../utils/qnaUtil';
import { validatedDialogsSelector } from '../../recoilModel/selectors/validatedDialogs';

import { getReferredLuFiles } from './../../utils/luUtil';
import { PublishDialog } from './publishDialog';
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
  const qnaFiles = useRecoilValue(qnaFilesState);
  const settings = useRecoilValue(settingsState);
  const projectId = useRecoilValue(projectIdState);
  const botLoadErrorMsg = useRecoilValue(botLoadErrorState);
  const botEndpoints = useRecoilValue(botEndpointsState);
  const {
    publishToTarget,
    onboardingAddCoachMarkRef,
    build,
    getPublishStatus,
    setBotStatus,
    setSettings,
    setQnASettings,
  } = useRecoilValue(dispatcherState);
  const connected = botStatus === BotStatus.connected;
  const publishing = botStatus === BotStatus.publishing;
  const reloading = botStatus === BotStatus.reloading;
  const addRef = useCallback((startBot) => onboardingAddCoachMarkRef({ startBot }), []);
  const errorLength = notifications.filter((n) => n.severity === 'Error').length;
  const showError = errorLength > 0;
  const publishDialogConfig = { subscriptionKey: settings.qna.subscriptionKey, ...settings.luis } as IConfig;
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

  async function handlePublish(config: IPublishConfig) {
    setBotStatus(BotStatus.publishing);
    dismissDialog();
    const { luis, qna } = config;
    await setSettings(projectId, {
      ...settings,
      luis: luis,
      qna: Object.assign({}, settings.qna, qna),
    });
    await build(luis.authoringKey, qna.subscriptionKey, qna.qnaRegion, projectId);
  }

  async function handleLoadBot() {
    setBotStatus(BotStatus.reloading);
    if (settings.qna && settings.qna.subscriptionKey) {
      await setQnASettings(projectId, settings.qna.subscriptionKey);
    }
    const sensitiveSettings = settingsStorage.get(projectId);
    await publishToTarget(projectId, DefaultPublishConfig, { comment: '' }, sensitiveSettings);
  }

  function isConfigComplete(config) {
    let complete = true;
    if (getReferredLuFiles(luFiles, dialogs).length > 0) {
      if (Object.keys(LuisConfig).some((luisConfigKey) => config?.[luisConfigKey] === '')) {
        complete = false;
      }
    }
    if (getReferredQnaFiles(qnaFiles, dialogs).length > 0) {
      if (Object.keys(QnaConfig).some((qnaConfigKey) => config?.[qnaConfigKey] === '')) {
        complete = false;
      }
    }
    return complete;
  }

  // return true if dialogs have one with default recognizer.
  function needsPublish(dialogs) {
    let isDefaultRecognizer = false;
    if (dialogs.some((dialog) => typeof dialog.content.recognizer === 'string')) {
      isDefaultRecognizer = true;
    }
    return isDefaultRecognizer;
  }

  async function handleStart() {
    dismissCallout();
    const config = Object.assign(
      {},
      {
        luis: settings.luis,
        qna: {
          subscriptionKey: settings.qna.subscriptionKey,
          qnaRegion: settings.qna.qnaRegion,
          endpointKey: '',
        },
      }
    );
    if (!isAbsHosted() && needsPublish(dialogs)) {
      if (botStatus === BotStatus.failed || botStatus === BotStatus.pending || !isConfigComplete(config)) {
        openDialog();
      } else {
        await handlePublish(config);
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
      {settings.luis && modalOpen && (
        <PublishDialog
          botName={botName}
          config={publishDialogConfig}
          isOpen={modalOpen}
          onDismiss={dismissDialog}
          onPublish={handlePublish}
        />
      )}
    </Fragment>
  );
};
