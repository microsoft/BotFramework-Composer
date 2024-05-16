// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment, useEffect, useState } from 'react';
import { useRecoilValue, useRecoilCallback, CallbackInterface } from 'recoil';
import { useMount, useUnmount } from '@fluentui/react-hooks';

import { Header } from './components/Header';
import { Announcement } from './components/AppComponents/Announcement';
import { MainContainer } from './components/AppComponents/MainContainer';
import { dispatcherState, userSettingsState, lgFileState } from './recoilModel';
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
  const { appLocale } = useRecoilValue(userSettingsState);

  const [isClosing, setIsClosing] = useState(false);
  const [listener, setListener] = useState<{ destroy(): boolean }>({} as any);

  const {
    fetchExtensions,
    fetchFeatureFlags,
    checkNodeVersion,
    setBotBuilderVersion,
    performAppCleanupOnQuit,
    setMachineInfo,
  } = useRecoilValue(dispatcherState);
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
    loadLocale(appLocale);
  }, [appLocale]);

  useEffect(() => {
    checkNodeVersion();
    setBotBuilderVersion();
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
      {isClosing && <LoadingSpinner inModal message="Finishing closing the application. Performing cleanup." />}
      <Logger />
      <Announcement />
      <Header />
      <MainContainer />
    </Fragment>
  );
};
