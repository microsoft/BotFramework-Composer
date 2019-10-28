import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { navigate } from '@reach/router';
import formatMessage from 'format-message';

import { StoreContext } from '../store';
import onboardingState from '../utils/onboardingStorage';
import { OpenConfirmModal } from '../components/Modal';

import { IStepSet, stepSets as defaultStepSets } from './onboarding';
import OnboardingContext from './context';
import TeachingBubbles from './TeachingBubbles';
import WelcomeModal from './WelcomeModal';

const Onboarding: React.FC = () => {
  const didMountRef = useRef(false);
  const showingDismissModal = useRef(false);

  const {
    actions: { onboardingSetComplete, openBotProject },
    state: {
      dialogs,
      botName,
      onboarding: { complete },
      recentProjects,
    },
  } = useContext(StoreContext);

  const [currentCoachMark, setCurrentCoachMark] = useState<any>({});
  const [currentSet, setCurrentSet] = useState<number>(onboardingState.getCurrentSet());
  const [currentStep, setCurrentStep] = useState<number>(onboardingState.getCurrentStep());
  const [minimized, updateMinimized] = useState<boolean>(!!~onboardingState.getCurrentStep());
  const [stepSets, setStepSets] = useState<IStepSet[]>(defaultStepSets());
  const [teachingBubble, setTeachingBubble] = useState<any>({});
  const toggleMinimized = useCallback(() => updateMinimized(minimized => !minimized), [updateMinimized]);

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
  }, [setCurrentSet]);

  const onComplete = useCallback(() => {
    onboardingSetComplete(true);
    setCurrentStep(-1);
    setCurrentSet(-1);
    onboardingState.set({ complete: true });
  }, [onboardingSetComplete, setCurrentSet, setCurrentStep]);

  const exit = useCallback(async () => {
    if (!showingDismissModal.current) {
      showingDismissModal.current = true;
      const result = await OpenConfirmModal(
        formatMessage('Leave Product Tour?'),
        formatMessage(
          'Are you sure you want to exit the Onboarding Product Tour? You can restart the tour in the onboarding settings.'
        )
      );
      if (result) {
        onComplete();
      }
      showingDismissModal.current = false;
    }
  }, [onComplete]);

  const setMinimized = useCallback(minimized => updateMinimized(minimized), [updateMinimized]);

  useEffect(() => {
    const { steps } = stepSets[currentSet] || { steps: [] };
    const coachMark = steps[currentStep] || {};
    const { id, location, navigateTo, targetId } = coachMark;
    navigateTo && navigate(navigateTo);

    setTeachingBubble({ currentStep, id, location, setLength: steps.length, targetId });
  }, [currentStep, setCurrentCoachMark]);

  useEffect(() => {
    updateMinimized(!!~currentStep);
    onboardingState.setCurrentSet(currentSet);
    onboardingState.setCurrentStep(currentStep);
  }, [currentStep, currentSet]);

  useEffect(() => {
    if (complete && didMountRef.current) {
      setCurrentStep(-1);
      setCurrentSet(-1);
    }
    didMountRef.current = true;
  }, [complete]);

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
      currentCoachMark,
      currentSet,
      currentStep,
      minimized,
      stepSets,
      teachingBubble,
    },
  };

  return !complete ? (
    <OnboardingContext.Provider value={value}>
      <WelcomeModal />
      <TeachingBubbles />
    </OnboardingContext.Provider>
  ) : null;
};

export default Onboarding;
