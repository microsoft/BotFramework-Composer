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

type Props = {
  onSignOut?: () => void;
} & IPersonaProps;

export const UserPersona = (props: Props) => {
  const { closeDialog } = usePublishApi();
  const { addNotification } = useApplicationApi();

  const signoutAndNotify = React.useCallback(async () => {
    const isSignedOut = await logOut();
    if (isSignedOut) {
      addNotification(
        getLogoutNotificationSettings(formatMessage('You have successfully signed out of Azure'), 'info')
      );
      closeDialog();
    } else {
      addNotification(
        getLogoutNotificationSettings(
          formatMessage(
            'There was an error attempting to sign out of Azure. To complete sign out, you may need to restart Composer.'
          ),
          'error'
        )
      );
    }
  }, [addNotification]);

  const onRenderSecondaryText = React.useCallback(
    (personaProps: IPersonaProps) => {
      return (
        <div
          role="button"
          style={{ color: 'blue', cursor: 'pointer' }}
          onClick={async () => {
            const confirmed = await OpenConfirmModal(
              formatMessage('Sign out of Azure'),
              formatMessage(
                'By signing out of Azure, your new publishing profile will be canceled and this dialog will close. Do you want to continue?'
              ),
              {
                onRenderContent: (subtitle: string) => <div>{subtitle}</div>,
                confirmText: formatMessage('Sign out'),
                cancelText: formatMessage('Cancel'),
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
    [signoutAndNotify, props.onSignOut]
  );
  return <Persona {...props} onRenderSecondaryText={props.onRenderSecondaryText || onRenderSecondaryText} />;
};
