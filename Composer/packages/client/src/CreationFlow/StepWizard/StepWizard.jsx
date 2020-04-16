// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';

import { styles } from './styles';

export function StepWizard(props) {
  const { steps, step, onDismiss } = props;
  const currentStep = steps[step];

  const hidden = !currentStep;
  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.normal,
        title: hidden ? '' : currentStep.title,
        subText: hidden ? '' : currentStep.subText,
        styles: styles.dialog,
      }}
      hidden={hidden}
      modalProps={{
        isBlocking: false,
        styles: styles.modal,
      }}
      onDismiss={onDismiss}
    >
      {!hidden && currentStep.children}
    </Dialog>
  );
}
