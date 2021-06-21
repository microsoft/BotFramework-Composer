// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { usePublishApi } from '@bfc/extension-client';
import formatMessage from 'format-message';
import { useRecoilValue } from 'recoil';

import { WizardStep, Wizard } from '../shared/wizard';
import { importConfigurationState } from '../../recoilModel/atoms/importConfigurationState';

import { ImportInstructionsStep } from './steps/ImportInstructionsStep';
import { PublishConfigEditorStep } from './steps/PublishConfigEditorStep';
import { WizardFooter } from './footers/WizardFooter';

const removePlaceholder = (config: any) => {
  try {
    if (config) {
      let str = JSON.stringify(config);
      str = str.replace(/<[^>]*>/g, '');
      const newConfig = JSON.parse(str);
      return newConfig;
    } else {
      return undefined;
    }
  } catch (e) {
    console.error(e);
  }
};

type Props = {
  onStepChange?: (stepIndex: number, step: WizardStep) => void;
  stepIndex?: number;
};

export const ImportResourcesWizard = React.memo((props: Props) => {
  const { onStepChange } = props;
  const [steps, setSteps] = React.useState<WizardStep[]>([]);
  const { onBack, savePublishConfig, closeDialog: onCancel } = usePublishApi();
  const { config, isValidConfiguration } = useRecoilValue(importConfigurationState);

  React.useEffect(() => {
    setSteps([
      {
        id: 'import-instructions',
        title: formatMessage('Configure resources to your publishing profile'),
        subTitle: formatMessage('How would you like to provision Azure resources to your publishing profile?'),
        onRenderContent: () => <ImportInstructionsStep />,
        onBack,
        onCancel,
      },
      {
        id: 'provide-configuration',
        title: formatMessage('Import existing resources'),
        subTitle: formatMessage('Please provide your Publish Configuration'),
        onRenderContent: () => <PublishConfigEditorStep />,
        navigationState: { nextText: formatMessage('Import'), canGoNext: config && isValidConfiguration },
        onNext: () => savePublishConfig(removePlaceholder(config)),
        onCancel,
      },
    ]);
  }, [config, config, isValidConfiguration]);

  return (
    <Wizard
      firstStepId="import-instructions"
      steps={steps}
      onRenderFooter={(navState) => <WizardFooter {...navState} />}
      onRenderHeader={() => <></>} // Returning fragment to override the default header rendering behaviour
      onStepChange={(index, step) => onStepChange(index, step)}
    />
  );
});
