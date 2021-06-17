// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { usePublishApi } from '@bfc/extension-client';
import formatMessage from 'format-message';

import { WizardStep, Wizard } from '../shared/wizard';

import { ImportInstructionsStep } from './steps/ImportInstructionsStep';

type Props = {
  onStepChange?: (stepIndex: number, step: WizardStep) => void;
  stepIndex?: number;
};

export const ImportResourcesWizard = React.memo((props: Props) => {
  const { onStepChange } = props;
  const [steps, setSteps] = React.useState<WizardStep[]>([]);
  const { onBack } = usePublishApi();

  React.useEffect(() => {
    setSteps([
      {
        id: 'import-instructions',
        title: formatMessage('Configure resources to your publishing profile'),
        subTitle: formatMessage('How would you like to provision Azure resources to your publishing profile?'),
        onRenderContent: () => <ImportInstructionsStep />,
        onBack,
      },
    ]);
  }, []);

  return (
    <Wizard
      firstStepId="import-instructions"
      steps={steps}
      onRenderHeader={() => <></>} // Returning fragment to override the default header rendering behaviour
      onStepChange={(index, step) => onStepChange(index, step)}
    />
  );
});
