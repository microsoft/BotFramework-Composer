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
  & button:nth-last-child(1) {
    margin-right: 0px;
  }
`;

type Props = {} & WizardStep;

export const WizardFooter = (props: Props) => {
  const { navigationState: navigation } = props;

  return (
    <ButtonContainer>
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
    </ButtonContainer>
  );
};
