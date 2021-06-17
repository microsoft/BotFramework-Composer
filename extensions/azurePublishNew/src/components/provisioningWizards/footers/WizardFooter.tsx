// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import formatMessage from 'format-message';
import styled from '@emotion/styled';
import { DefaultButton } from 'office-ui-fabric-react';

import { WizardStep } from '../../shared/wizard';

const FooterButton = styled(DefaultButton)`
  margin-right: 8px;
`;

const ButtonContainer = styled.div`
  & button:last-of-type {
    margin-right: 0px;
  }
`;

type Props = WizardStep;

export const WizardFooter = (props: Props) => {
  const { navigationState: navigation } = props;

  return (
    <ButtonContainer>
      <FooterButton
        disabled={!navigation.canGoBack}
        text={navigation.backText || formatMessage('Back')}
        onClick={() => props.onBack()}
      />
      <FooterButton
        primary
        disabled={!navigation.canGoNext}
        text={navigation.nextText || formatMessage('Next')}
        onClick={() => props.onNext()}
      />
      <FooterButton
        disabled={!navigation.canCancel}
        text={navigation.cancelText || formatMessage('Cancel')}
        onClick={() => props.onCancel()}
      />
    </ButtonContainer>
  );
};
