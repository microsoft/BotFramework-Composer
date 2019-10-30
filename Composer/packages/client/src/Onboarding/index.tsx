// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { navigate, Location } from '@reach/router';
import formatMessage from 'format-message';

import { StoreContext } from '../store';
import onboardingState from '../utils/onboardingStorage';
import { OpenConfirmModal } from '../components/Modal';

import { IStepSet, stepSets as defaultStepSets } from './onboarding';
import OnboardingContext from './context';
import TeachingBubbles from './TeachingBubbles';
import WelcomeModal from './WelcomeModal';

const getCurrentSet = stepSets => stepSets.findIndex(({ id }) => id === onboardingState.getCurrentSet('setUpBot'));

const Onboarding: React.FC = () => {
  const didMount = useRef(false);
  const {
    actions: { onboardingSetComplete },
    state: {
      dialogs,
      onboarding: { complete },
    },
  } = useContext(StoreContext);

  const [stepSets, setStepSets] = useState<IStepSet[]>(defaultStepSets());
  const [currentSet, setCurrentSet] = useState<number>(getCurrentSet(stepSets));
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [hideModal, setHideModal] = useState(true);
  const [minimized, updateMinimized] = useState<boolean>(false);
  const [teachingBubble, setTeachingBubble] = useState<any>({});

  useEffect(() => {
    onboardingSetComplete(onboardingState.getComplete());
  }, []);

  useEffect(() => {
    if (didMount.current && complete) {
      setCurrentSet(0);
      setCurrentStep(0);
    }
    didMount.current = true;
  }, [complete, stepSets]);

  useEffect(() => {
    const { steps } = stepSets[currentSet] || { steps: [] };
    const coachMark = steps[currentStep] || {};
    const { id, location, navigateTo, targetId } = coachMark;
    !complete && navigateTo && navigate(navigateTo);

    setTeachingBubble({ currentStep, id, location, setLength: steps.length, targetId });

    setHideModal(currentSet === 0);
    updateMinimized(!!~currentStep);

    currentSet > -1 && currentSet < stepSets.length && onboardingState.setCurrentSet(stepSets[currentSet].id);
  }, [currentSet, currentStep, setTeachingBubble]);

  useEffect(() => {
    const sets = defaultStepSets()
      .map(stepSet => ({
        ...stepSet,
        steps: stepSet.steps.filter(({ targetId }) => {
          if (!dialogs.length) {
            return !(targetId === 'mainDialog' || targetId === 'newTrigger' || targetId === 'action');
          } else if (!dialogs[0].triggers.length) {
            return targetId !== 'action';
          }
          return true;
        }),
      }))
      .filter(({ steps }) => steps.length);

    setStepSets(sets);
  }, [dialogs]);

  const nextSet = useCallback(() => {
    setCurrentSet(current => {
      let nextSet = -1;

      if (current + 1 < stepSets.length) {
        nextSet = current + 1;
        setCurrentStep(0);
      }
      return nextSet;
    });
  }, [setCurrentSet, stepSets]);

  const nextStep = useCallback(() => {
    const { steps } = stepSets[currentSet] || { steps: [] };
    setCurrentStep(current => (current + 1 < steps.length ? current + 1 : -1));
  }, [currentSet, setCurrentStep, stepSets]);

  const previousStep = useCallback(() => {
    setCurrentStep(current => (current > 0 ? current - 1 : current));
  }, [setCurrentStep]);

  const onComplete = useCallback(() => {
    onboardingSetComplete(true);
    onboardingState.set({ complete: true });
  }, [onboardingSetComplete]);

  const exit = useCallback(async () => {
    const result = await OpenConfirmModal(
      formatMessage('Leave Product Tour?'),
      formatMessage(
        'Are you sure you want to exit the Onboarding Product Tour? You can restart the tour in the onboarding settings.'
      )
    );
    if (result) {
      onComplete();
    }
  }, [onComplete]);

  const setMinimized = useCallback(minimized => updateMinimized(minimized), [updateMinimized]);

  const toggleMinimized = useCallback(() => updateMinimized(minimized => !minimized), [updateMinimized]);

  const value = {
    actions: {
      exit,
      nextSet,
      nextStep,
      onComplete,
      previousStep,
      setMinimized,
      toggleMinimized,
    },
    state: {
      complete,
      currentSet,
      currentStep,
      hideModal,
      minimized,
      stepSets,
      teachingBubble,
    },
  };

  return !complete ? (
    <OnboardingContext.Provider value={value}>
      <WelcomeModal />
      <TeachingBubbles />
      <Location>
        {({ location: { pathname } }) => {
          setHideModal(pathname !== '/dialogs/Main');
          if (pathname === '/dialogs/Main' && currentSet === 0) {
            setCurrentStep(-1);
          }
          return null;
        }}
      </Location>
    </OnboardingContext.Provider>
  ) : null;
};

export default Onboarding;
