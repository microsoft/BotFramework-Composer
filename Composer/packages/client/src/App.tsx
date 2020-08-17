// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment, useEffect, useState } from 'react';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import generate from 'format-message-generate-id';
import formatMessage, { Translation } from 'format-message';
import { useRecoilValue } from 'recoil';

import { Header } from './components/Header';
import { Announcement } from './components/AppComponents/Announcement';
import { MainContainer } from './components/AppComponents/MainContainer';
import { userSettingsState } from './recoilModel';
import httpClient from './utils/httpUtil';

initializeIcons(undefined, { disableWarnings: true });

type LocaleFile = { [key: string]: string | Translation } | undefined;

function setLocale(appLocale: string, localeFile?: LocaleFile) {
  formatMessage.setup({
    locale: appLocale,
    generateId: generate.underscored_crc32,
    missingTranslation: process.env.NODE_ENV === 'development' ? 'warning' : 'ignore',
    translations: {
      [appLocale]: localeFile,
    },
  });
}

export const App: React.FC = () => {
  const { appLocale } = useRecoilValue(userSettingsState);
  const [localeFile, setLocaleFile] = useState<LocaleFile>({});

  useEffect(() => {
    (async () => {
      const resp = await httpClient.get(`/assets/locales/${appLocale}.json`);
      console.log(resp.data['0_bytes_a1e1cdb3']);
      const data = resp?.data;
      setLocaleFile(data);
      setLocale(appLocale, localeFile);
    })();
  }, [appLocale]);

  setLocale(appLocale, localeFile);

  return (
    <Fragment>
      <Announcement />
      <Header />
      <MainContainer />
    </Fragment>
  );
};
