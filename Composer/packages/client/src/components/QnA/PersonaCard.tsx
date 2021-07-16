// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { Persona, IPersonaProps, PersonaSize } from 'office-ui-fabric-react/lib/Persona';
import { useRecoilValue } from 'recoil';
import { OpenConfirmModal } from '@bfc/ui-shared';
import { IRenderFunction } from '@uifabric/utilities';

import { currentUserState, isAuthenticatedState, dispatcherState } from '../../recoilModel';

export const PersonaCard: React.FC = (props) => {
  const currentUser = useRecoilValue(currentUserState);
  const isAuthenticated = useRecoilValue(isAuthenticatedState);

  const { logoutUser } = useRecoilValue(dispatcherState);

  const onLogout = async () => {
    const confirmed = await OpenConfirmModal(
      formatMessage('Sign out of Azure'),
      formatMessage(
        'By signing out of Azure, your operation will be canceled and this dialog will close. Do you want to continue?'
      ),
      {
        onRenderContent: (subtitle: string) => <div>{subtitle}</div>,
        confirmText: formatMessage('Sign out'),
        cancelText: formatMessage('Cancel'),
      }
    );
    if (confirmed) {
      await logoutUser();
    }
  };

  const onRenderSecondaryText: IRenderFunction<IPersonaProps> = (props) => {
    if (!props) return null;
    return (
      <div
        role="button"
        style={{ color: 'blue', cursor: 'pointer' }}
        tabIndex={0}
        onClick={onLogout}
        onKeyPress={onLogout}
      >
        {props.secondaryText}
      </div>
    );
  };

  return isAuthenticated && currentUser ? (
    <Persona
      secondaryText={formatMessage('Sign out')}
      size={PersonaSize.size40}
      text={currentUser?.name}
      onRenderSecondaryText={onRenderSecondaryText}
      {...props}
    />
  ) : null;
};
