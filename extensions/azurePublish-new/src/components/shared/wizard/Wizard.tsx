// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { WizardFooter } from './WizardFooter';
import { WizardProvider } from './WizardContext';
import { WizardStep } from './WizardStep';
import { WizardSteps } from './WizardSteps';
type Props = {
  onStepChange?: (stepId: string) => void;
  children: React.ReactNode;
};
export const Wizard = (props: Props) => {
  const { children, onStepChange } = props;
  return <WizardProvider onStepChange={onStepChange}>{children}</WizardProvider>;
};
Wizard.Step = WizardStep;
Wizard.Steps = WizardSteps;
Wizard.Footer = WizardFooter;
// load steps progressively
// hide the components when not in viewport instead of unmounting or put the component state in recoil and re-populate on mount
// if hiding is optimal, figure out a way to hide the component
// use react context or recoil to share the step information across the components
// Memoize the steps
// use hooks to manage the steps, so they can be changed from the step & stepper
