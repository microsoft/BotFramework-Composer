// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment } from 'react';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import generate from 'format-message-generate-id';
import formatMessage from 'format-message';
import { useRecoilValue } from 'recoil';

import { Header } from './components/Header';
import { Announcement } from './components/AppComponents/Announcement';
import { MainContainer } from './components/AppComponents/MainContainer';
import pseudo from './locales/en-US-pseudo.json';
import { userSettingsState } from './recoilModel';

initializeIcons(undefined, { disableWarnings: true });

export const App: React.FC = () => {
  const { appLocale } = useRecoilValue(userSettingsState);

  formatMessage.setup({
    locale: appLocale,
    generateId: generate.underscored_crc32,
    missingTranslation: process.env.NODE_ENV === 'development' ? 'warning' : 'ignore',
    translations: {
      'en-US-pseudo': pseudo,
    },
  });

  return (
    <Fragment>
      <Announcement />
      <Header />
      <MainContainer />
    </Fragment>
  );
};
