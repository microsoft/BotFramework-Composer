// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { createContext, useContext } from 'react';

import { IStep, IStepSet } from './content';

interface OnboardingContext {
  actions: {
    exit: () => void;
    nextSet: () => void;
    nextStep: () => void;
    onComplete: () => void;
    previousStep: () => void;
    setMinimized: (_: boolean) => void;
    toggleMinimized: () => void;
  };
  state: {
    complete: boolean;
    currentSet: number;
    currentStep: number;
    minimized: boolean;
    hideModal: boolean;
    stepSets: IStepSet[];
    teachingBubble: (IStep & { setLength: number }) | null;
  };
}

const OnboardingContext = createContext<OnboardingContext>({
  actions: {
    exit: () => {},
    nextSet: () => {},
    nextStep: () => {},
    onComplete: () => {},
    previousStep: () => {},
    setMinimized: (_: boolean) => {},
    toggleMinimized: () => {},
  },
  state: {
    complete: true,
    currentSet: -1,
    currentStep: -1,
    hideModal: true,
    minimized: false,
    stepSets: [],
    teachingBubble: null,
  },
});

export const useOnboardingContext = () => useContext(OnboardingContext);

export default OnboardingContext;
