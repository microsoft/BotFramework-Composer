// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useRef, Fragment, useContext, useEffect, useCallback } from 'react';
import { ActionButton, PrimaryButton, DefaultButton, IconButton } from 'office-ui-fabric-react/lib/Button';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { Callout } from 'office-ui-fabric-react/lib/Callout';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import formatMessage from 'format-message';
import { DiagnosticSeverity, Diagnostic } from '@bfc/shared';

import settingsStorage from './utils/dialogSettingStorage';
import { StoreContext } from './store';
import { bot, botButton, calloutLabel, calloutDescription, calloutContainer, errorButton, errorCount } from './styles';
import { BotStatus, LuisConfig } from './constants';
import { PublishLuisDialog } from './publishDialog';
import { OpenAlertModal, DialogStyle } from './components/Modal';
import { isAbsHosted } from './utils/envUtil';
import { getReferredFiles } from './utils/luUtil';
import useNotifications from './pages/notifications/useNotifications';
import { navigateTo, openInEmulator } from './utils';
import { DefaultPublishConfig } from './constants';

export const TestController: React.FC = () => {
  const { state, actions } = useContext(StoreContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [calloutVisible, setCalloutVisible] = useState(state.botLoadErrorMsg.title !== '');
  const [luisPublishSucceed, setLuisPublishSucceed] = useState(true);
  const botActionRef = useRef(null);
  const notifications = useNotifications();
  const {
    botEndpoints,
    botName,
    botStatus,
    dialogs,
    toStartBot,
    luFiles,
    settings,
    projectId,
    botLoadErrorMsg,
  } = state;
  const { publishToTarget, onboardingAddCoachMarkRef, publishLuis, startBot, getPublishStatus, setBotStatus } = actions;
  const connected = botStatus === BotStatus.connected;
  const publishing = botStatus === BotStatus.publishing;
  const reloading = botStatus === BotStatus.reloading;
  const addRef = useCallback(startBot => onboardingAddCoachMarkRef({ startBot }), []);
  const errorLength = notifications.filter(n => n.severity === 'Error').length;
  const showError = errorLength > 0;

  useEffect(() => {
    toStartBot && handleClick();
    startBot(false);
  }, [toStartBot]);

  useEffect(() => {
    if (projectId) {
      getPublishStatus(projectId, DefaultPublishConfig);
    }
  }, [projectId]);

  useEffect(() => {
    if (botLoadErrorMsg.title !== '') setCalloutVisible(true);
  }, [botLoadErrorMsg]);

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

  async function handleClick() {
    const diagnostics = dialogs.reduce<Diagnostic[]>((result, dialog) => {
      const errors = dialog.diagnostics.filter(n => n.severity === DiagnosticSeverity.Error);
      if (errors.length !== 0) {
        return result.concat(errors);
      }
      return result;
    }, []);
    if (diagnostics.length !== 0) {
      const title = `StaticValidationError`;
      const subTitle = diagnostics.reduce((msg, diagnostic) => {
        msg += `${diagnostic.message} \n`;
        return msg;
      }, '');

      OpenAlertModal(title, subTitle, {
        style: DialogStyle.Console,
      });
      return;
    }
    const config = settings.luis;

    if (!isAbsHosted() && getReferredFiles(luFiles, dialogs).length > 0) {
      if (!luisPublishSucceed || !isLuisConfigComplete(config)) {
        setModalOpen(true);
      } else {
        await publishAndReload();
      }
    } else {
      await handleLoadBot();
    }
  }

  async function publishAndReload() {
    if (await handlePublish()) {
      setLuisPublishSucceed(true);
      await handleLoadBot();
    } else {
      setLuisPublishSucceed(false);
    }
  }

  async function handlePublish() {
    setBotStatus(BotStatus.publishing);
    try {
      const luisConfig = settingsStorage.get(botName) ? settingsStorage.get(botName).luis : null;
      await publishLuis(luisConfig.authoringKey, state.projectId);
      return true;
    } catch (err) {
      return false;
    }
  }

  async function handleLoadBot() {
    setBotStatus(BotStatus.reloading);
    const sensitiveSettings = settingsStorage.get(botName);
    await publishToTarget(state.projectId, DefaultPublishConfig, { comment: '' }, sensitiveSettings);
  }

  function handleErrorButtonClick() {
    navigateTo(`/bot/${state.projectId}/notifications`);
  }

  return (
    <Fragment>
      <div css={bot} ref={botActionRef}>
        {connected && !showError && (
          <ActionButton
            iconProps={{
              iconName: 'OpenInNewTab',
            }}
            onClick={async () => {
              return Promise.resolve(
                openInEmulator(
                  botEndpoints[projectId] || 'http://localhost:3979/api/messages',
                  settings.MicrosoftAppId && settings.MicrosoftAppPassword
                    ? { MicrosoftAppId: settings.MicrosoftAppId, MicrosoftAppPassword: settings.MicrosoftAppPassword }
                    : { MicrosoftAppPassword: '', MicrosoftAppId: '' }
                )
              );
            }}
          >
            {formatMessage('Test in Emulator')}
          </ActionButton>
        )}
        {(publishing || reloading) && (
          <Spinner
            size={SpinnerSize.small}
            label={publishing ? formatMessage('Publishing') : formatMessage('Reloading')}
            ariaLive="assertive"
            labelPosition="left"
          />
        )}
        <div ref={addRef}>
          {showError && (
            <div style={{ float: 'left' }} onClick={handleErrorButtonClick} data-testid="notifications-info-button">
              <span css={errorCount}>{errorLength}</span>
              <IconButton iconProps={{ iconName: 'ErrorBadge' }} css={errorButton} title="Error" ariaLabel="Error" />
            </div>
          )}
          <PrimaryButton
            css={botButton}
            text={connected ? formatMessage('Restart Bot') : formatMessage('Start Bot')}
            onClick={handleClick}
            id={'publishAndConnect'}
            disabled={showError || publishing || reloading}
          />
        </div>
        <Callout
          role="alertdialog"
          ariaLabelledBy="callout-label-id"
          ariaDescribedBy="callout-description-id"
          gapSpace={0}
          target={botActionRef.current}
          onDismiss={() => setCalloutVisible(false)}
          setInitialFocus={true}
          hidden={!calloutVisible}
        >
          <div css={calloutContainer}>
            <p css={calloutLabel} id="callout-label-id">
              {botLoadErrorMsg.title}
            </p>
            <p css={calloutDescription} id="callout-description-id">
              {botLoadErrorMsg.message}
            </p>
            <Stack
              horizontal
              tokens={{
                childrenGap: 'm',
              }}
            >
              <PrimaryButton
                onClick={() => {
                  setCalloutVisible(false);
                  handleClick();
                }}
                text={formatMessage('Try again')}
              />
              <DefaultButton onClick={() => setCalloutVisible(false)} text={formatMessage('Cancel')} />
            </Stack>
          </div>
        </Callout>
      </div>
      {modalOpen ? (
        <PublishLuisDialog
          isOpen={true}
          onDismiss={() => setModalOpen(false)}
          onPublish={() => {
            publishAndReload();
            setModalOpen(false);
          }}
          botName={botName}
        />
      ) : null}
    </Fragment>
  );
};
