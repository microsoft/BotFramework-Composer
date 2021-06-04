// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import styled from '@emotion/styled';
import formatMessage from 'format-message';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react';
import { usePublishApi, useTelemetryClient } from '@bfc/extension-client';

import useWizard from './hooks/useWizard';
type Props = {
  canProceedToNext?: boolean;
  backButtonTitle?: string;
  nextButtonTitle?: string;
  cancelButtonTitle?: string;
  showUserPersona?: boolean;
};

const FooterButton = styled(DefaultButton)`
  margin: 0 4px;
`;
export const WizardFooter = (props: Props) => {
  const { canProceedToNext, backButtonTitle, nextButtonTitle, cancelButtonTitle } = props;
  const { onNext, onPrevious, activeStepIndex, steps } = useWizard();
  const { closeDialog } = usePublishApi();
  const telemetryClient = useTelemetryClient();
  return (
    <div>
      <FooterButton
        disabled={activeStepIndex === 0}
        text={formatMessage(backButtonTitle ?? 'Back')}
        onClick={onPrevious}
      />
      <FooterButton
        primary
        disabled={activeStepIndex === steps.length - 1}
        text={formatMessage(nextButtonTitle ?? 'Next')}
        onClick={onNext}
      />
      <FooterButton
        text={formatMessage(cancelButtonTitle ?? 'Cancel')}
        onClick={() => {
          telemetryClient?.track('ProvisionCancel');
          closeDialog();
        }}
      />
    </div>
  );
};
