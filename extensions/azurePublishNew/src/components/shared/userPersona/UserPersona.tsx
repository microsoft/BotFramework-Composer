// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IPersonaProps, Persona } from 'office-ui-fabric-react';
import formatMessage from 'format-message';
import * as React from 'react';
import { Notification } from '@botframework-composer/types';
import { logOut, usePublishApi, useApplicationApi } from '@bfc/extension-client';
import { OpenConfirmModal } from '@bfc/ui-shared';

const getLogoutNotificationSettings = (description: string, type: Notification['type']) => {
  return {
    title: '',
    retentionTime: 5000,
    description: description,
    type,
    onRenderCardContent: (props) => (
      <div style={{ padding: '0 16px 16px 16px', fontSize: '12px' }}>{props.description}</div>
    ),
  };
};

const messages = {
  signedOutSuccessfully: formatMessage('You have successfully signed out of Azure'),
  signOutOutError: formatMessage(
    'There was an error attempting to sign out of Azure. To complete sign out, you may need to restart Composer.'
  ),
  signOutConfirmationTitle: formatMessage('Sign out of Azure'),
  signOutConfirmationContent: formatMessage(
    'By signing out of Azure, your new publishing profile will be canceled and this dialog will close. Do you want to continue?'
  ),
  signOut: formatMessage('Sign out'),
  cancel: formatMessage('Cancel'),
};
type Props = {
  onSignOut?: () => void;
} & IPersonaProps;
export const UserPersona = (props: Props) => {
  const { closeDialog } = usePublishApi();
  const { addNotification } = useApplicationApi();

  const signoutAndNotify = React.useCallback(async () => {
    const isSignedOut = await logOut();
    if (isSignedOut) {
      addNotification(getLogoutNotificationSettings(messages.signedOutSuccessfully, 'info'));
      closeDialog();
    } else {
      addNotification(getLogoutNotificationSettings(messages.signOutOutError, 'error'));
    }
  }, [addNotification]);

  const onRenderSecondaryText = React.useMemo(
    () => (personaProps: IPersonaProps) => {
      return (
        <div
          role="button"
          style={{ color: 'blue', cursor: 'pointer' }}
          onClick={async () => {
            const confirmed = await OpenConfirmModal(
              messages.signOutConfirmationTitle,
              messages.signOutConfirmationContent,
              {
                onRenderContent: (subtitle: string) => <div>{subtitle}</div>,
                confirmText: messages.signOut,
                cancelText: messages.cancel,
              }
            );
            if (confirmed) {
              await signoutAndNotify();
              props.onSignOut?.();
            }
          }}
        >
          {personaProps.secondaryText}
        </div>
      );
    },
    [signoutAndNotify]
  );
  return <Persona {...props} onRenderSecondaryText={props.onRenderSecondaryText || onRenderSecondaryText} />;
};
