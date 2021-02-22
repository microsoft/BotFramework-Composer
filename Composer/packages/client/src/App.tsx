// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment, useEffect } from 'react';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { useRecoilValue } from 'recoil';

import { Header } from './components/Header';
import { Announcement } from './components/AppComponents/Announcement';
import { MainContainer } from './components/AppComponents/MainContainer';
import { dispatcherState, userSettingsState } from './recoilModel';
import { loadLocale } from './utils/fileUtil';
import { useInitializeLogger } from './telemetry/useInitializeLogger';

initializeIcons(undefined, { disableWarnings: true });

const Logger = () => {
  useInitializeLogger();
  return null;
};

export const App: React.FC = () => {
  const { appLocale } = useRecoilValue(userSettingsState);
  const { fetchExtensions, fetchFeatureFlags } = useRecoilValue(dispatcherState);

  useEffect(() => {
    loadLocale(appLocale);
  }, [appLocale]);

  useEffect(() => {
    fetchExtensions();
    fetchFeatureFlags();
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
