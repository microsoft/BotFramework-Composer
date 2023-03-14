// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { Header } from './components/Header';
import { Announcement } from './components/AppComponents/Announcement';
import { MainContainer } from './components/AppComponents/MainContainer';
import { dispatcherState, userSettingsState } from './recoilModel';
import { loadLocale } from './utils/fileUtil';
import { useInitializeLogger } from './telemetry/useInitializeLogger';
import { setupIcons } from './setupIcons';
import { LoadingSpinner } from './components/LoadingSpinner';

setupIcons();

const Logger = () => {
  useInitializeLogger();
  return null;
};

const { ipcRenderer } = window;
export const App: React.FC = () => {
  const { appLocale } = useRecoilValue(userSettingsState);

  const [isClosing, setIsClosing] = useState(false);

  const {
    fetchExtensions,
    fetchFeatureFlags,
    checkNodeVersion,
    performAppCleanupOnQuit,
    setMachineInfo,
  } = useRecoilValue(dispatcherState);

  useEffect(() => {
    loadLocale(appLocale);
  }, [appLocale]);

  useEffect(() => {
    checkNodeVersion();
    fetchExtensions();
    fetchFeatureFlags();

    ipcRenderer?.on('machine-info', (_event, info) => {
      setMachineInfo(info);
    });

    ipcRenderer?.on('closing', async () => {
      setIsClosing(true);
      await performAppCleanupOnQuit();
      ipcRenderer.send('closed');
    });
  }, []);

  return (
    <Fragment key={appLocale}>
      {isClosing && <LoadingSpinner inModal message="Finishing closing the application. Performing cleanup." />}
      <Logger />
      <Announcement />
      <Header />
      <MainContainer />
    </Fragment>
  );
};
