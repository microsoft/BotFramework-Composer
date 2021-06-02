// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useReducer, createContext } from 'react';
type Action = { type: 'next' | 'previous' | 'steps'; payload?: any };
type WizardState = {
  activeStepIndex: number;
  steps: any[];
  onStepChange?: (stepName: string, index: number) => void;
};
type Dispatch = (action: Action) => void;
const InitialWizardState = {
  activeStepIndex: 0,
  steps: [],
};

type InitialWizardStateAndDispatch = WizardState & { dispatch?: React.Dispatch<Action> };

export const WizardStateContext = createContext<InitialWizardStateAndDispatch>(InitialWizardState);

const wizardReducer = (state: WizardState = InitialWizardState, action: Action) => {
  switch (action.type) {
    case 'next':
      return {
        ...state,
        activeStepIndex:
          state.activeStepIndex === state.steps.length - 1 ? state.activeStepIndex : state.activeStepIndex + 1,
      };
    case 'previous':
      return {
        ...state,
        activeStepIndex: state.activeStepIndex === 0 ? state.activeStepIndex : state.activeStepIndex - 1,
      };
    case 'steps':
      return {
        ...state,
        steps: action.payload,
      };
  }
};

export const WizardProvider = ({ children, onStepChange }) => {
  const [wizardState, dispatch] = useReducer(wizardReducer, InitialWizardState);

  return (
    <WizardStateContext.Provider value={{ ...wizardState, dispatch, onStepChange }}>
      {children}
    </WizardStateContext.Provider>
  );
};
