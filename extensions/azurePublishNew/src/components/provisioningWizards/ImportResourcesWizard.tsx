// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { usePublishApi } from '@bfc/extension-client';
import formatMessage from 'format-message';

import { WizardStep, Wizard } from '../shared/wizard';

import { ImportInstructionsStep } from './steps';

type Props = {
  onStepChange: (stepId: string) => void;
  stepIndex?: number;
};
export const ImportResourcesWizard = React.memo((props: Props) => {
  const { stepIndex, onStepChange } = props;
  const [steps, setSteps] = React.useState<WizardStep[]>([]);
  const { setTitle, onBack } = usePublishApi();
  const setDialogTitle = (step: WizardStep) => {
    step && setTitle({ title: step.title, subText: step.subTitle });
    return <></>;
  };
  React.useEffect(() => {
    setSteps([
      {
        id: '1',
        title: formatMessage('Configure resources to your publishing profile'),
        subTitle: formatMessage('How would you like to provision Azure resources to your publishing profile?'),
        onRenderContent: () => <ImportInstructionsStep />,
        onBack,
      },
    ]);
  }, []);
  return (
    <Wizard
      firstStepId={stepIndex?.toString() ?? '1'}
      steps={steps}
      onRenderHeader={(step) => setDialogTitle(step)}
      onStepChange={(step) => onStepChange(step.id)}
    />
  );
});
