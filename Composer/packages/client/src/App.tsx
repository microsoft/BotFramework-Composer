// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment, useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { Header } from './components/Header';
import { Announcement } from './components/AppComponents/Announcement';
import { MainContainer } from './components/AppComponents/MainContainer';
import { dispatcherState, userSettingsState } from './recoilModel';
import { loadLocale } from './utils/fileUtil';
import { ClientStorage } from './utils/storage';
import { useInitializeLogger } from './telemetry/useInitializeLogger';
import { setupIcons } from './setupIcons';

setupIcons();

const Logger = () => {
  useInitializeLogger();
  return null;
};

const surveyStorage = new ClientStorage(window.localStorage, 'survey');

const { ipcRenderer } = window;
export const App: React.FC = () => {
  const { appLocale } = useRecoilValue(userSettingsState);

  const {
    fetchExtensions,
    fetchFeatureFlags,
    checkNodeVersion,
    performAppCleanupOnQuit,
    setSurveyEligibility,
  } = useRecoilValue(dispatcherState);

  useEffect(() => {
    loadLocale(appLocale);
  }, [appLocale]);

  useEffect(() => {
    checkNodeVersion();
    fetchExtensions();
    fetchFeatureFlags();
    ipcRenderer?.on('cleanup', (_event) => {
      performAppCleanupOnQuit();
    });

    let days = surveyStorage.get('days', 0);
    const lastUsed = surveyStorage.get('lastUsed', null);
    const today = new Date().toDateString();
    if (lastUsed !== today) {
      days += 1;
      surveyStorage.set('days', days);
    }
    if (days >= 5) {
      // eligible for HaTS notification
      setSurveyEligibility(true);
    }
    surveyStorage.set('lastUsed', today);
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
