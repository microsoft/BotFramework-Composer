// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect } from 'react';

import useWizard from './hooks/useWizard';

export const WizardSteps = ({ children }) => {
  const { activeStepIndex, setSteps, steps } = useWizard();
  useEffect(() => {
    const stepperSteps = React.Children.toArray(children)
      .filter((step) => {
        return (step as any)?.type?.name === 'WizardStep';
      })
      .map((step) => (step as any)?.props);
    setSteps(stepperSteps);
  }, [setSteps, children]);
  return <div>{children && React.Children.toArray(children)[activeStepIndex]}</div>;
};
