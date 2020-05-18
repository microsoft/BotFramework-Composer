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
import { PublishLuisDialog } from '../TestController/publishDialog';
import { bot, botButton } from '../TestController/styles';
import { ErrorCallout } from '../TestController/errorCallout';
import { EmulatorOpenButton } from '../TestController/emulatorOpenButton';
import { Loading } from '../TestController/loading';
import { ErrorInfo } from '../TestController/errorInfo';

export const TestsController: React.FC = () => {
  const { state, actions } = useContext(StoreContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [calloutVisible, setCalloutVisible] = useState(false);
  const botActionRef = useRef(null);
  const notifications = useNotifications();
  const { botEndpoints, botName, botStatus, dialogs, luFiles, settings, projectId, botLoadErrorMsg } = state;
  const { testTarget, onboardingAddCoachMarkRef, publishLuis, getPublishStatus, setBotStatus } = actions;
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
    }
  }, [botStatus]);

  function dismissCallout() {
    if (calloutVisible) setCalloutVisible(false);
  }

  function openCallout() {
    setCalloutVisible(true);
  }

  async function handleTestBot() {
    setBotStatus(BotStatus.reloading);
    await testTarget(DefaultPublishConfig);
  }

  async function handleStart() {
    dismissCallout();
    await handleTestBot();
  }

  function handleErrorButtonClick() {}

  return (
    <Fragment>
      <div css={bot} ref={botActionRef}>
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
            text={formatMessage('Start Test')}
            onClick={handleStart}
            id={'test'}
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
    </Fragment>
  );
};
