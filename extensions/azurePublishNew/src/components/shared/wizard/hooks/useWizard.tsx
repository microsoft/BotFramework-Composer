// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext, useCallback } from 'react';

import { WizardStateContext } from '../WizardContext';

const useWizard = () => {
  const { activeStepIndex, steps, dispatch, onStepChange } = useContext(WizardStateContext);

  const onNext = useCallback(() => {
    dispatch?.({ type: 'next' });
    onStepChange?.(activeStepIndex + 1);
  }, [dispatch]);

  const onPrevious = useCallback(() => {
    dispatch?.({ type: 'previous' });
    onStepChange?.(activeStepIndex - 1);
  }, [dispatch]);

  const setSteps = useCallback((steps) => dispatch?.({ type: 'steps', payload: steps }), [dispatch]);

  const setCanProceedToNext = () => {};

  return { onNext, onPrevious, setSteps, setCanProceedToNext, activeStepIndex, steps, onStepChange };
};

export default useWizard;
