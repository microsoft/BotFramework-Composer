// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Fragment, useEffect } from 'react';
import { AuthManager } from '@azure/ms-rest-browserauth';

export const LoginPage = (props) => {
  const authManager = new AuthManager({
    clientId: 'f3723d34-6ff5-4ceb-a148-d99dcd2511fc',
    redirectUri: 'https://dev.botframework.com/cb',
  });

  useEffect(() => {
    authManager.finalizeLogin().then((res) => {
      if (!res.isLoggedIn) {
        authManager.login();
      } else {
        console.log(res.creds);
        console.log('Available subscriptions: ', res.availableSubscriptions);
      }
    });
  }, [props]);
  return <Fragment></Fragment>;
};
