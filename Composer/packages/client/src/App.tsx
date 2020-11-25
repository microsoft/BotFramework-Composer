// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment, useEffect } from 'react';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { useRecoilValue } from 'recoil';

import { Header } from './components/Header';
import { Announcement } from './components/AppComponents/Announcement';
import { MainContainer } from './components/AppComponents/MainContainer';
import { userSettingsState } from './recoilModel';
import { loadLocale } from './utils/fileUtil';
import { dispatcherState } from './recoilModel/DispatcherWrapper';

initializeIcons(undefined, { disableWarnings: true });

export const App: React.FC = () => {
  const { appLocale } = useRecoilValue(userSettingsState);
  const { fetchExtensions, fetchFeatureFlags, fetchServerSettings } = useRecoilValue(dispatcherState);

  useEffect(() => {
    loadLocale(appLocale);
  }, [appLocale]);

  useEffect(() => {
    fetchExtensions();
    fetchFeatureFlags();
    fetchServerSettings();
  }, []);

  return (
    <Fragment key={appLocale}>
      <Announcement />
      <Header />
      <MainContainer />
    </Fragment>
  );
};
