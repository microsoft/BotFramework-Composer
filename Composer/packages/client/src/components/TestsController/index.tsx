// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useRef, Fragment, useContext, useEffect, useCallback } from 'react';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';

import { bot, botButton } from '../TestController/styles';
import { ErrorCallout } from '../TestController/errorCallout';
import { Loading } from '../TestController/loading';
import { ErrorInfo } from '../TestController/errorInfo';

import { BotStatus, DefaultPublishConfig } from './../../constants';
import useNotifications from './../../pages/notifications/useNotifications';
import { StoreContext } from './../../store';

export const TestsController: React.FC = () => {
  const { state, actions } = useContext(StoreContext);
  const [] = useState(false);
  const [calloutVisible, setCalloutVisible] = useState(false);
  const botActionRef = useRef(null);
  const notifications = useNotifications();
  const { botStatus, projectId, botLoadErrorMsg } = state;
  const { testTarget, onboardingAddCoachMarkRef, getPublishStatus, setBotStatus } = actions;
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
    await testTarget(projectId, DefaultPublishConfig);
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
