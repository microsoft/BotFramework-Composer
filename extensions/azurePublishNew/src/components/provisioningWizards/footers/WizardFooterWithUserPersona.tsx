// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import formatMessage from 'format-message';
import styled from '@emotion/styled';
import { DefaultButton, PersonaSize } from 'office-ui-fabric-react';

import { UserInfo } from '../../../recoilModel/types';
import { UserPersona } from '../../shared/userPersona/UserPersona';
import { WizardStep } from '../../shared/wizard';

type ProvisonActionsStylingProps = {
  showSignout: boolean;
};

const ProvisonActions = styled.div<ProvisonActionsStylingProps>((props) => ({
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: props.showSignout ? 'space-between' : 'flex-end',
}));

const FooterButton = styled(DefaultButton)`
  margin: 0 4px;
`;

type Props = { userInfo: UserInfo } & WizardStep;

export const WizardFooterWithUserPersona = (props: Props) => {
  const { userInfo, navigationState: navigation } = props;
  const isSignedIn = !!props.userInfo;

  return (
    <ProvisonActions showSignout={isSignedIn}>
      {isSignedIn ? (
        <UserPersona secondaryText={formatMessage('Sign out')} size={PersonaSize.size40} text={userInfo?.name} />
      ) : null}
      <div>
        <FooterButton
          disabled={!navigation.canGoBack}
          text={formatMessage(navigation.backText || 'Back')}
          onClick={() => props.onBack()}
        />
        <FooterButton
          primary
          disabled={!navigation.canGoNext}
          text={formatMessage(navigation.nextText || 'Next')}
          onClick={() => props.onNext()}
        />
        <FooterButton
          disabled={!navigation.canCancel}
          text={formatMessage(navigation.cancelText || 'Cancel')}
          onClick={() => props.onCancel()}
        />
      </div>
    </ProvisonActions>
  );
};
