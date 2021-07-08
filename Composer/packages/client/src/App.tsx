// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment, useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { Header } from './components/Header';
import { Announcement } from './components/AppComponents/Announcement';
import { MainContainer } from './components/AppComponents/MainContainer';
import { dispatcherState, userSettingsState } from './recoilModel';
import { loadLocale } from './utils/fileUtil';
import { useInitializeLogger } from './telemetry/useInitializeLogger';
import { setupIcons } from './setupIcons';
import { appCleanupManager } from './utils/appCleanupManager';

setupIcons();

const Logger = () => {
  useInitializeLogger();
  return null;
};

const { ipcRenderer } = window;
export const App: React.FC = () => {
  const { appLocale } = useRecoilValue(userSettingsState);

  const {
    fetchExtensions,
    fetchFeatureFlags,
    checkNodeVersion,
    performAppCleanupOnQuit,
    setSurveyEligibility,
    setMachineInfo,
  } = useRecoilValue(dispatcherState);

  useEffect(() => {
    loadLocale(appLocale);
  }, [appLocale]);

  useEffect(() => {
    checkNodeVersion();
    fetchExtensions();
    fetchFeatureFlags();
    appCleanupManager.registerTask(performAppCleanupOnQuit);

    ipcRenderer?.on('machine-info', (_event, info) => {
      setMachineInfo(info);
      setSurveyEligibility();
    });
  }, []);

  return (
    <Fragment key={appLocale}>
      <Logger />
      <Announcement />
      <Header />
      <MainContainer />
    </Fragment>
  );
};
