// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { MsalAuthenticationTemplate, MsalProvider } from '@azure/msal-react';
import * as msal from '@azure/msal-browser';

import { msalApplication } from './msal';
import { Header } from './components/Header';
import { Announcement } from './components/AppComponents/Announcement';
import { MainContainer } from './components/AppComponents/MainContainer';
import { dispatcherState, msalState, userSettingsState } from './recoilModel';
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
  const [isClosing, setIsClosing] = useState(false);
  const { appLocale } = useRecoilValue(userSettingsState);
  const { setMsalState } = useRecoilValue(dispatcherState);
  const msalApp = useRecoilValue(msalState);

  const { performAppCleanupOnQuit, setMachineInfo } = useRecoilValue(dispatcherState);

  useEffect(() => {
    ipcRenderer?.invoke('app-init').then(({ machineInfo, isOneAuthEnabled }) => {
      setMachineInfo(machineInfo);
      setOneAuthEnabled(isOneAuthEnabled);
    });

    ipcRenderer?.on('closing', async () => {
      setIsClosing(true);
      await performAppCleanupOnQuit();
      ipcRenderer.send('closed');
    });

    setMsalState(msalApplication);
  }, []);

  return (
    <Fragment key={appLocale}>
      {msalApplication === null ? (
        <></>
      ) : (
        <MsalProvider instance={msalApplication}>
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
      )}
    </Fragment>
  );
};
