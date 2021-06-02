// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import formatMessage from 'format-message';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react';
import { usePublishApi, useTelemetryClient } from '@bfc/extension-client';

import useStepper from './hooks/useWizard';
type Props = {
  canProceedToNext?: boolean;
  backButtonTitle?: string;
  nextButtonTitle?: string;
  cancelButtonTitle?: string;
  showUserPersona?: boolean;
};

export const WizardFooter = (props: Props) => {
  const { canProceedToNext, backButtonTitle, nextButtonTitle, cancelButtonTitle } = props;
  const { onNext, onPrevious, activeStepIndex } = useStepper();
  const { closeDialog } = usePublishApi();
  const telemetryClient = useTelemetryClient();
  return (
    <div>
      <DefaultButton
        disabled={activeStepIndex === 0}
        style={{ margin: '0 4px' }}
        text={formatMessage(backButtonTitle ?? 'Back')}
        onClick={onPrevious}
      />
      <PrimaryButton style={{ margin: '0 4px' }} text={formatMessage(nextButtonTitle ?? 'Next')} onClick={onNext} />
      <DefaultButton
        style={{ margin: '0 4px' }}
        text={formatMessage(cancelButtonTitle ?? 'Cancel')}
        onClick={() => {
          telemetryClient?.track('ProvisionCancel');
          closeDialog();
        }}
      />
    </div>
  );
};
