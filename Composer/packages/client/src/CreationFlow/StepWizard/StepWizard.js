import React from 'react';
import { Dialog, DialogType } from 'office-ui-fabric-react';

import { styles } from './styles';

export function StepWizard(props) {
  const { steps, step, onDismiss } = props;
  const currentStep = steps[step];

  const hidden = !currentStep;
  return (
    <Dialog
      hidden={hidden}
      onDismiss={onDismiss}
      dialogContentProps={{
        type: DialogType.normal,
        title: hidden ? '' : currentStep.title,
        subText: hidden ? '' : currentStep.subText,
        styles: styles.dialog,
      }}
      modalProps={{
        isBlocking: false,
        styles: styles.modal,
      }}
    >
      {!hidden && currentStep.children}
    </Dialog>
  );
}
