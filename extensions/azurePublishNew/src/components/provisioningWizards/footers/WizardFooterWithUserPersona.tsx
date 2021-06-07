// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import formatMessage from 'format-message';
import styled from '@emotion/styled';
import { DefaultButton, PersonaSize } from 'office-ui-fabric-react';

import { UserInfo } from '../../../recoilModel/types';
import { UserPersona } from '../../shared/userPersona/UserPersona';
import { WizardNavigationState } from '../../shared/wizard/WizardNew';

type ProvisonActionsStylingProps = {
  showSignout: boolean;
};
const ProvisonActions = styled.div<ProvisonActionsStylingProps>((props) => ({
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: props.showSignout ? 'space-between' : 'flex-end',
}));

const FooterButton = styled(DefaultButton)`
  margin: '0 4px';
`;

type Props = { userInfo: UserInfo } & WizardNavigationState;

const messages = {
  back: formatMessage('Back'),
  cancel: formatMessage('Cancel'),
  next: formatMessage('Next'),
};

export const WizardFooterWithUserPersona = (props: Props) => {
  const isSignin = !!props.userInfo;
  return (
    <ProvisonActions showSignout={isSignin}>
      {isSignin ? (
        <UserPersona secondaryText={formatMessage('Sign out')} size={PersonaSize.size40} text={props.userInfo?.name} />
      ) : null}
      <div>
        <FooterButton
          disabled={!props.canGoBack}
          style={{ margin: '0 4px' }}
          text={props.backText || messages.back}
          onClick={() => props.onBack()}
        />
        <FooterButton
          primary
          disabled={!props.canGoNext}
          style={{ margin: '0 4px' }}
          text={props.nextText || messages.next}
          onClick={() => props.onNext()}
        />
        <FooterButton
          disabled={!props.canCancel}
          style={{ margin: '0 4px' }}
          text={props.cancelText || messages.cancel}
          onClick={() => props.onCancel()}
        />
      </div>
    </ProvisonActions>
  );
};
