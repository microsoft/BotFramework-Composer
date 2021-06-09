// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { usePublishApi } from '@bfc/extension-client';
import formatMessage from 'format-message';

import { WizardStep, Wizard } from '../shared/wizard';

import { HandOffInstructionsStep } from './steps';

type Props = {
  onStepChange?: (stepIndex: number, stepId: string) => void;
  stepIndex?: number;
};

export const HandOffToAdminWizard = React.memo((props: Props) => {
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
        id: 'handoff-instructions',
        title: formatMessage('Configure resources to your publishing profile'),
        subTitle: formatMessage('How would you like to provision Azure resources to your publishing profile?'),
        onRenderContent: () => <HandOffInstructionsStep />,
        onBack,
      },
    ]);
  }, []);

  return (
    <Wizard
      firstStepId={steps[stepIndex]?.id ?? 'handoff-instructions'}
      steps={steps}
      onRenderHeader={(step) => setDialogTitle(step)}
      onStepChange={(index, step) => onStepChange(index, step.id)}
    />
  );
});
