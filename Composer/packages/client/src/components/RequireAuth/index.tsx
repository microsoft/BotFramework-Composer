/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useEffect, useState, useContext } from 'react';
import { Spinner, SpinnerSize, Dialog, DialogType, DialogFooter, PrimaryButton } from 'office-ui-fabric-react';
import formatMessage from 'format-message';
import once from 'lodash.once';

import { StoreContext } from '../../store';
import { BoundAction } from '../../store/types';

import { loading, dialog, consoleStyle } from './styles';

// only attempt to login once
const loginOnce = once((login: BoundAction) => {
  if (process.env.COMPOSER_REQUIRE_AUTH) {
    login();
  }
});

export const RequireAuth: React.FC = props => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { state, actions } = useContext(StoreContext);
  const { currentUser } = state;

  useEffect(() => {
    loginOnce(actions.loginUser);
  }, []);

  useEffect(() => {
    setIsLoading(!currentUser.token);
  }, [currentUser.token]);

  const sessionExpiredDialog = currentUser.sessionExpired && (
    <Dialog
      hidden={false}
      onDismiss={() => false}
      dialogContentProps={{
        type: DialogType.normal,
        title: formatMessage('Session expired'),
        styles: dialog,
      }}
      modalProps={{
        isBlocking: false,
        styles: { main: { maxWidth: 450 } },
      }}
    >
      <div css={consoleStyle}>{formatMessage('Please log in before continuing.')}</div>
      <DialogFooter>
        <PrimaryButton onClick={() => actions.loginUser()} text={formatMessage('Login')} />
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
