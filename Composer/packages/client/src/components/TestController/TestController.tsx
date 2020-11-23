// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */

import React, { useState, useRef, Fragment, useEffect, useCallback, useMemo } from 'react';
import { jsx, css } from '@emotion/core';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';
import { useRecoilValue } from 'recoil';
import { IConfig, IPublishConfig, defaultPublishConfig, checkForPVASchema } from '@bfc/shared';
import { EditorExtension, PluginConfig, mergePluginConfigs } from '@bfc/extension-client';

import {
  botEndpointsState,
  dispatcherState,
  validateDialogsSelectorFamily,
  botStatusState,
  botDisplayNameState,
  luFilesState,
  qnaFilesState,
  settingsState,
  botLoadErrorState,
  schemasState,
} from '../../recoilModel';
import settingsStorage from '../../utils/dialogSettingStorage';
import { BotStatus } from '../../constants';
import { isAbsHosted } from '../../utils/envUtil';
import useNotifications from '../../pages/notifications/useNotifications';
import { navigateTo, openInEmulator } from '../../utils/navigation';
import plugins from '../../plugins';
import { useShell } from '../../shell/useShell';

import { isBuildConfigComplete, isKeyRequired, needsBuild } from './../../utils/buildUtil';
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

let botStatusInterval: NodeJS.Timeout | undefined = undefined;

// -------------------- TestController -------------------- //
const POLLING_INTERVAL = 2500;
export const TestControllerContent: React.FC<{ projectId: string }> = (props) => {
  const { projectId = '' } = props;
  const [modalOpen, setModalOpen] = useState(false);
  const [calloutVisible, setCalloutVisible] = useState(false);

  const botActionRef = useRef(null);
  const notifications = useNotifications(projectId);

  const dialogs = useRecoilValue(validateDialogsSelectorFamily(projectId));
  const schemas = useRecoilValue(schemasState(projectId));
  const botStatus = useRecoilValue(botStatusState(projectId));
  const botName = useRecoilValue(botDisplayNameState(projectId));
  const luFiles = useRecoilValue(luFilesState(projectId));
  const settings = useRecoilValue(settingsState(projectId));
  const qnaFiles = useRecoilValue(qnaFilesState(projectId));
  const botLoadErrorMsg = useRecoilValue(botLoadErrorState(projectId));

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
  const publishDialogConfig = { subscriptionKey: settings.qna?.subscriptionKey, ...settings.luis } as IConfig;
  const warningLength = notifications.filter((n) => n.severity === 'Warning').length;
  const showWarning = !showError && warningLength > 0;

  useEffect(() => {
    if (projectId) {
      getPublishStatus(projectId, defaultPublishConfig);
    }
  }, [projectId]);

  useEffect(() => {
    switch (botStatus) {
      case BotStatus.failed:
        openCallout();
        stopPollingRuntime();
        setBotStatus(BotStatus.pending, projectId);
        break;
      case BotStatus.published:
        stopPollingRuntime();
        handleLoadBot();
        break;
      case BotStatus.reloading:
        startPollingRuntime();
        break;
      default:
      case BotStatus.connected:
        stopPollingRuntime();
        break;
    }
    return () => {
      stopPollingRuntime();
      return;
    };
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

  function startPollingRuntime() {
    if (!botStatusInterval) {
      const cancelInterval = setInterval(() => {
        // get publish status
        getPublishStatus(projectId, defaultPublishConfig);
      }, POLLING_INTERVAL);
      botStatusInterval = cancelInterval;
    }
  }

  function stopPollingRuntime() {
    if (botStatusInterval) {
      clearInterval(botStatusInterval);
      botStatusInterval = undefined;
    }
  }

  async function handleBuild(config: IPublishConfig) {
    setBotStatus(BotStatus.publishing, projectId);
    dismissDialog();
    const { luis, qna } = config;

    await setSettings(projectId, {
      ...settings,
      luis: luis,
      qna: Object.assign({}, settings.qna, qna),
    });
    await build(luis, qna, projectId);
  }

  async function handleLoadBot() {
    setBotStatus(BotStatus.reloading, projectId);
    if (settings.qna && settings.qna.subscriptionKey) {
      await setQnASettings(projectId, settings.qna.subscriptionKey);
    }
    const sensitiveSettings = settingsStorage.get(projectId);
    await publishToTarget(projectId, defaultPublishConfig, { comment: '' }, sensitiveSettings);
  }

  async function handleStart() {
    dismissCallout();
    const config = {
      luis: { ...settings.luis },
      qna: { ...settings.qna },
    };

    if (isAbsHosted() || !needsBuild(dialogs)) {
      return await handleLoadBot();
    }

    if (!isKeyRequired(dialogs, luFiles, qnaFiles)) {
      return await handleBuild(config);
    }

    if (
      botStatus === BotStatus.failed ||
      botStatus === BotStatus.pending ||
      !isBuildConfigComplete(config, dialogs, luFiles, qnaFiles)
    ) {
      openDialog();
    } else {
      await handleBuild(config);
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

  const renderEmulatorOpenButton = () => {
    if (checkForPVASchema(schemas.sdk)) return null;
    return (
      <EmulatorOpenButton
        botEndpoint={botEndpoints[projectId] || 'http://localhost:3979/api/messages'}
        botStatus={botStatus}
        hidden={showError}
        onClick={handleOpenEmulator}
      />
    );
  };

  const renderPublishingStatus = () => {
    if (checkForPVASchema(schemas.sdk)) return null;
    return (
      <div
        aria-label={publishing ? formatMessage('Publishing') : reloading ? formatMessage('Reloading') : ''}
        aria-live={'assertive'}
      />
    );
  };

  const renderLoading = () => {
    if (checkForPVASchema(schemas.sdk)) return null;
    return <Loading botStatus={botStatus} />;
  };

  const renderStartButton = () => {
    if (checkForPVASchema(schemas.sdk)) return null;
    return (
      <PrimaryButton
        css={botButton}
        disabled={showError || publishing || reloading}
        id={'publishAndConnect'}
        text={connected ? formatMessage('Restart Bot') : formatMessage('Start Bot')}
        onClick={handleStart}
      />
    );
  };

  return (
    <Fragment>
      <div ref={botActionRef} css={bot}>
        {renderEmulatorOpenButton()}
        {renderPublishingStatus()}
        {renderLoading()}
        <div ref={addRef}>
          <ErrorInfo count={errorLength} hidden={!showError} onClick={handleErrorButtonClick} />
          <WarningInfo count={warningLength} hidden={!showWarning} onClick={handleErrorButtonClick} />
          {renderStartButton()}
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
          projectId={projectId}
          onDismiss={dismissDialog}
          onPublish={handleBuild}
        />
      )}
    </Fragment>
  );
};

export const TestController: React.FC<{ projectId: string }> = (props) => {
  const schemas = useRecoilValue(schemasState(props.projectId));
  const shellForPropertyEditor = useShell('DesignPage', props.projectId);

  const pluginConfig: PluginConfig = useMemo(() => {
    const sdkUISchema = schemas?.ui?.content ?? {};
    const userUISchema = schemas?.uiOverrides?.content ?? {};
    return mergePluginConfigs({ uiSchema: sdkUISchema }, plugins, { uiSchema: userUISchema });
  }, [schemas?.ui?.content, schemas?.uiOverrides?.content]);

  return (
    <EditorExtension plugins={pluginConfig} projectId={props.projectId} shell={shellForPropertyEditor}>
      <TestControllerContent {...props} />
    </EditorExtension>
  );
};
