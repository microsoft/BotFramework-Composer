// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { MsalAuthenticationTemplate, MsalProvider } from '@azure/msal-react';
import * as msal from '@azure/msal-browser';

import { msalApplication } from './msal';
import { Header } from './components/Header';
import { Announcement } from './components/AppComponents/Announcement';
import { MainContainer } from './components/AppComponents/MainContainer';
import { dispatcherState, userSettingsState } from './recoilModel';
import { loadLocale } from './utils/fileUtil';
import { useInitializeLogger } from './telemetry/useInitializeLogger';
import { setupIcons } from './setupIcons';
import { setOneAuthEnabled } from './utils/oneAuthUtil';
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
  const [msalInstance, setMsalInstance] = useState<msal.PublicClientApplication>(msalApplication);

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

    ipcRenderer?.invoke('app-init').then(({ machineInfo, isOneAuthEnabled }) => {
      setMachineInfo(machineInfo);
      setOneAuthEnabled(isOneAuthEnabled);
    });

    ipcRenderer?.on('closing', async () => {
      setIsClosing(true);
      await performAppCleanupOnQuit();
      ipcRenderer.send('closed');
    });
  }, []);

  return (
    <Fragment key={appLocale}>
      <MsalProvider instance={msalInstance}>
        <MsalAuthenticationTemplate
          errorComponent={() => {
            return <>ERROR</>;
          }}
          interactionType={msal.InteractionType.Redirect}
          loadingComponent={() => {
            return <>LOADING</>;
          }}
        >
          {isClosing && <LoadingSpinner inModal message="Finishing closing the application. Performing cleanup." />}
          <Logger />
          <Announcement />
          <Header />
          <MainContainer />
        </MsalAuthenticationTemplate>
      </MsalProvider>
    </Fragment>
  );
};
