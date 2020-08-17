// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment } from 'react';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { useRecoilValue } from 'recoil';

import { Header } from './components/Header';
import { Announcement } from './components/AppComponents/Announcement';
import { MainContainer } from './components/AppComponents/MainContainer';
import { userSettingsState } from './recoilModel';

initializeIcons(undefined, { disableWarnings: true });

export const App: React.FC = () => {
  const { appLocale } = useRecoilValue(userSettingsState);

  return (
    <Fragment key={appLocale}>
      <Announcement />
      <Header />
      <MainContainer />
    </Fragment>
  );
};
