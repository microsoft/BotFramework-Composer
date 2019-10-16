import React, { createContext } from 'react';

import { IStep, IStepSet } from './onboarding';

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
    currentCoachMark: any;
    currentSet: number;
    currentStep: number;
    minimized: boolean;
    stepSets: IStepSet[];
    teachingBubble: IStep & { setLength: number } | null;
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
    currentCoachMark: {},
    currentSet: -1,
    currentStep: -1,
    minimized: false,
    stepSets: [],
    teachingBubble: null,
  },
});

export default OnboardingContext;
