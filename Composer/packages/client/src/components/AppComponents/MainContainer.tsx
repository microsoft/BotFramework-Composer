// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { Router } from '@reach/router';
import { useRecoilValue } from 'recoil';
import { useEffect } from 'react';

import { NotificationContainer } from '../Notifications/NotificationContainer';
import { dispatcherState, userSettingsState } from '../../recoilModel';
import { getToken } from '../../msal';
import { loadLocale } from '../../utils/fileUtil';

import { SideBar } from './SideBar';
import { RightPanel } from './RightPanel';
import { Assistant } from './Assistant';

const main = css`
  height: calc(100vh - 50px);
  display: flex;
`;

export const MainContainer = () => {
  const { setCurrentUser } = useRecoilValue(dispatcherState);
  const { appLocale } = useRecoilValue(userSettingsState);
  useEffect(() => {
    const token = getToken().then((token) => {
      setCurrentUser(token);
    });
  }, []);

  const { fetchExtensions, fetchFeatureFlags, checkNodeVersion } = useRecoilValue(dispatcherState);

  useEffect(() => {
    checkNodeVersion();
    fetchExtensions();
    fetchFeatureFlags();
  }, []);

  useEffect(() => {
    loadLocale(appLocale);
  }, [appLocale]);

  return (
    <div css={main}>
      <Router primary={false}>
        <SideBar path="*" />
      </Router>
      <RightPanel />
      <Assistant />
      <NotificationContainer />
    </div>
  );
};
