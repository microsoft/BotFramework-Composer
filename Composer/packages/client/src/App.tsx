// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { useRecoilValue, useRecoilCallback, CallbackInterface } from 'recoil';
import { useMount, useUnmount } from '@fluentui/react-hooks';
import { MsalAuthenticationTemplate, MsalProvider } from '@azure/msal-react';
import * as msal from '@azure/msal-browser';

import { msalApplication } from './msal';
import { Header } from './components/Header';
import { Announcement } from './components/AppComponents/Announcement';
import { MainContainer } from './components/AppComponents/MainContainer';
import { dispatcherState, msalState, userSettingsState, lgFileState } from './recoilModel';
import { loadLocale } from './utils/fileUtil';
import { useInitializeLogger } from './telemetry/useInitializeLogger';
import { setupIcons } from './setupIcons';
import { setOneAuthEnabled } from './utils/oneAuthUtil';
import { LoadingSpinner } from './components/LoadingSpinner';
import lgWorker from './recoilModel/parsers/lgWorker';
import { LgEventType } from './recoilModel/parsers/types';

setupIcons();

const Logger = () => {
  useInitializeLogger();
  return null;
};

const { ipcRenderer } = window;
export const App: React.FC = () => {
  const [isClosing, setIsClosing] = useState(false);
  const [listener, setListener] = useState<{ destroy(): boolean }>({} as any);

  const {
    fetchExtensions,
    fetchFeatureFlags,
    checkNodeVersion,
    performAppCleanupOnQuit,
    setMachineInfo,
    setMsalState
  } = useRecoilValue(dispatcherState);
  const { appLocale } = useRecoilValue(userSettingsState);
  const msalApp = useRecoilValue(msalState);
  const updateFile = useRecoilCallback((callbackHelpers: CallbackInterface) => async ({ projectId, value }) => {
    callbackHelpers.set(lgFileState({ projectId, lgFileId: value.id }), value);
  });

  useMount(() => {
    const listener = lgWorker.listen(LgEventType.OnUpdateLgFile, (msg) => {
      const { projectId, payload } = msg.data;
      updateFile({ projectId, value: payload });
    });
    setListener(listener);
  });

  useUnmount(() => listener.destroy());

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
