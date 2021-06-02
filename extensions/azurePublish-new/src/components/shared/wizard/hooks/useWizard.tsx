// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext, useCallback } from 'react';

import { WizardStateContext } from '../WizardContext';

const useWizard = () => {
  //TODO: set state using recoil or react context
  const { activeStepIndex, steps, dispatch, onStepChange } = useContext(WizardStateContext);

  const onNext = useCallback(() => {
    dispatch?.({ type: 'next' });
    const title: string = activeStepIndex + 1 < steps.length ? steps[activeStepIndex].title : '';
    onStepChange?.(title, activeStepIndex + 1);
  }, [dispatch]);

  const onPrevious = useCallback(() => {
    dispatch?.({ type: 'previous' });
    const title: string = activeStepIndex - 1 >= 0 ? steps[activeStepIndex].title : '';
    onStepChange?.(title, activeStepIndex - 1);
  }, [dispatch]);

  const setSteps = useCallback((steps) => dispatch?.({ type: 'steps', payload: steps }), [dispatch]);
  const setCanProceedToNext = () => {};
  return { onNext, onPrevious, setSteps, setCanProceedToNext, activeStepIndex, steps, onStepChange };
};

export default useWizard;
