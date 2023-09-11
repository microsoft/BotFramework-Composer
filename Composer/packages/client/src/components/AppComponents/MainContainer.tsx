// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { Router } from '@reach/router';
import { useRecoilValue } from 'recoil';
import { useCallback, useEffect } from 'react';

import { currentUserState, dispatcherState, userSettingsState } from '../../recoilModel';
import { getToken, msalApplication } from '../../msal';
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
  const currentUser = useRecoilValue(currentUserState);

  const isCreator = useCallback((): boolean | undefined => {
    const users = msalApplication?.getAllAccounts() ?? [];
    if (users.length < 1) {
      console.log('no users');
      return undefined;
    }
    console.log('user is ' + JSON.stringify(users[0]));
    return (users[0]?.idTokenClaims as any)?.extension_IsCreator ?? false;
  }, []);

  const redirectToCustomerPortal = useCallback(() => {
    const isCreatorResult = isCreator();
    if (isCreatorResult === undefined) {
      return undefined;
    }
    if (isCreatorResult === false) {
      window.location.replace('https://bbot-uat-eun-userportal-as.azurewebsites.net/');
    }
  }, [isCreator]);

  useEffect(() => {
    redirectToCustomerPortal();
    getToken().then((token) => {
      setCurrentUser(token);
    });
  }, []);

  useEffect(() => {
    const expiration = currentUser.expiration;
    if (expiration != undefined) {
      const timeout = setTimeout(() => {
        getToken().then((token) => {
          setCurrentUser(token);
        });
      }, expiration - Date.now() - 1000 * 120);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [currentUser]);

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
    </div>
  );
};
