// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */

import React, { useEffect, useState } from 'react';
import { jsx, css } from '@emotion/core';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import formatMessage from 'format-message';
import once from 'lodash/once';
import { useRecoilValue } from 'recoil';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';

import { currentUserState, dispatcherState } from '../recoilModel';

// -------------------- Styles -------------------- //

const loading = css`
  display: flex;
  justify-content: center;
  height: 100vh;
`;

const consoleStyle = css`
  background: #000;
  color: #fff;
  padding: 15px;
  margin-bottom: 20px;
`;

const dialog = {
  title: {
    fontWeight: FontWeights.bold,
  },
};

// -------------------- RequireAuth -------------------- //

// only attempt to login once
const loginOnce = once((login: () => Promise<void>) => {
  if (process.env.COMPOSER_REQUIRE_AUTH) {
    login();
  }
});

export const RequireAuth: React.FC = (props) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { loginUser } = useRecoilValue(dispatcherState);
  const currentUser = useRecoilValue(currentUserState);

  useEffect(() => {
    loginOnce(loginUser);
  }, []);

  useEffect(() => {
    setIsLoading(currentUser.token === null);
  }, [currentUser.token]);

  const sessionExpiredDialog = currentUser.sessionExpired && (
    <Dialog
      dialogContentProps={{
        type: DialogType.normal,
        title: formatMessage('Session expired'),
        styles: dialog,
      }}
      hidden={false}
      modalProps={{
        isBlocking: false,
        styles: { main: { maxWidth: 450 } },
      }}
    >
      <div css={consoleStyle}>{formatMessage('Please log in before continuing.')}</div>
      <DialogFooter>
        <PrimaryButton text={formatMessage('Login')} onClick={() => loginUser()} />
      </DialogFooter>
    </Dialog>
  );

  if (process.env.COMPOSER_REQUIRE_AUTH) {
    if (!currentUser.sessionExpired && isLoading) {
      return (
        <div css={loading}>
          <Spinner label={formatMessage('Loading...')} size={SpinnerSize.large} />
        </div>
      );
    }
  }

  return (
    <React.Fragment>
      {sessionExpiredDialog}
      {props.children}
    </React.Fragment>
  );
};
