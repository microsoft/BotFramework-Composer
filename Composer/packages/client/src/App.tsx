// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment } from 'react';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';

import { Header } from './components/Header';
import { Announcement } from './components/AppComponents/Announcement';
import { MainContainer } from './components/AppComponents/MainContainer';

initializeIcons(undefined, { disableWarnings: true });

export const App: React.FC = () => {
  return (
    <Fragment>
      <Announcement />
      <Header />
      <MainContainer />
    </Fragment>
  );
};
