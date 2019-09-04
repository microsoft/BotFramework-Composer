import React, { useEffect, useState, useContext } from 'react';
import { Spinner, SpinnerSize, Dialog, DialogType, DialogFooter, PrimaryButton } from 'office-ui-fabric-react';
import formatMessage from 'format-message';
import { once } from 'lodash';

import { StoreContext } from '../../store';

import { loading, dialog, consoleStyle } from './styles';

// only attempt to login once
const loginOnce = once((login: () => void) => {
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
      <div css={consoleStyle}>{formatMessage('Log in and try agin.')}</div>
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
    <>
      {sessionExpiredDialog}
      {props.children}
    </>
  );
};
