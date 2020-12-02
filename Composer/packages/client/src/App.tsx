// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment, useEffect } from 'react';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { useRecoilValue } from 'recoil';
import { globalHistory } from '@reach/router';
import { useSetRecoilState } from 'recoil';

import { Header } from './components/Header';
import { Announcement } from './components/AppComponents/Announcement';
import { MainContainer } from './components/AppComponents/MainContainer';
import { currentProjectIdState, userSettingsState } from './recoilModel';
import { loadLocale } from './utils/fileUtil';
import { dispatcherState } from './recoilModel/DispatcherWrapper';

initializeIcons(undefined, { disableWarnings: true });

export const App: React.FC = () => {
  const { appLocale } = useRecoilValue(userSettingsState);
  const { fetchExtensions, fetchFeatureFlags, fetchServerSettings } = useRecoilValue(dispatcherState);
  const setCurrentProjectId = useSetRecoilState(currentProjectIdState);

  useEffect(() => {
    loadLocale(appLocale);
  }, [appLocale]);

  useEffect(() => {
    fetchExtensions();
    fetchFeatureFlags();
    fetchServerSettings();
  }, []);

  useEffect(
    () =>
      globalHistory.listen(({ location }) => {
        const botResult = location.pathname.match(/bot\/([0-9.]*)\//);
        const skillResult = location.pathname.match(/skill\/([0-9.]*)\//);
        if (skillResult) {
          setCurrentProjectId(skillResult[1]);
        } else if (botResult) {
          setCurrentProjectId(botResult[1]);
        }
      }),
    []
  );

  return (
    <Fragment key={appLocale}>
      <Announcement />
      <Header />
      <MainContainer />
    </Fragment>
  );
};
