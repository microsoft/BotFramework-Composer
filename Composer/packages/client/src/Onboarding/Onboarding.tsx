// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { navigate } from '@reach/router';
import formatMessage from 'format-message';
import { useRecoilValue } from 'recoil';

import onboardingStorage from '../utils/onboardingStorage';
import { OpenConfirmModal } from '../components/Modal/ConfirmDialog';
import { useLocation } from '../utils/hooks';
import { dispatcherState, onboardingState, botProjectIdsState, validateDialogSelectorFamily } from '../recoilModel';

import OnboardingContext from './OnboardingContext';
import TeachingBubbles from './TeachingBubbles/TeachingBubbles';
import WelcomeModal from './WelcomeModal/WelcomeModal';
import { IStepSet, stepSets as defaultStepSets } from './onboardingUtils';

const getCurrentSet = (stepSets) => stepSets.findIndex(({ id }) => id === onboardingStorage.getCurrentSet('setUpBot'));

const Onboarding: React.FC = () => {
  const didMount = useRef(false);
  const botProjects = useRecoilValue(botProjectIdsState);
  const rootBotProjectId = botProjects[0];
  const dialogs = useRecoilValue(validateDialogSelectorFamily(rootBotProjectId));
  const { onboardingSetComplete } = useRecoilValue(dispatcherState);
  const onboarding = useRecoilValue(onboardingState);
  const complete = onboarding.complete;

  const rootDialogId = dialogs.find(({ isRoot }) => isRoot === true)?.id || 'Main';

  const stepSets = useMemo<IStepSet[]>(() => {
    return defaultStepSets(rootBotProjectId, rootDialogId)
      .map((stepSet) => ({
        ...stepSet,
        steps: stepSet.steps.filter(({ targetId }) => {
          if (dialogs.length === 0) {
            return !(targetId === 'mainDialog' || targetId === 'newTrigger' || targetId === 'action');
          } else if (dialogs[0]?.triggers.length === 0) {
            return targetId !== 'action';
          }
          return true;
        }),
      }))
      .filter(({ steps }) => steps.length);
  }, [rootBotProjectId, rootDialogId]);

  const [currentSet, setCurrentSet] = useState<number>(getCurrentSet(stepSets));
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [hideModal, setHideModal] = useState(true);
  const [minimized, setMinimized] = useState<boolean>(false);
  const [teachingBubble, setTeachingBubble] = useState<any>({});

  const {
    location: { pathname },
  } = useLocation();

  useEffect(() => {
    if (didMount.current && complete) {
      setCurrentSet(0);
      setCurrentStep(0);
      setHideModal(true);
    }
    didMount.current = true;
  }, [complete]);

  useEffect(() => {
    const { steps } = stepSets[currentSet] || { steps: [] };
    const coachMark = steps[currentStep] || {};
    const { id, location, navigateTo, targetId } = coachMark;
    !complete && rootBotProjectId && navigateTo && navigate(navigateTo);
    setTeachingBubble({ currentStep, id, location, setLength: steps.length, targetId });

    setMinimized(currentStep >= 0);

    if (currentSet > -1 && currentSet < stepSets.length) {
      onboardingStorage.setCurrentSet(stepSets[currentSet].id);
    }
  }, [currentSet, currentStep, setTeachingBubble, rootBotProjectId]);

  useEffect(() => {
    setHideModal(pathname !== `/bot/${rootBotProjectId}/dialogs/${rootDialogId}`);
    if (currentSet === 0) {
      setCurrentStep(pathname === '/home' ? 0 : -1);
    }
  }, [pathname, rootDialogId]);

  const nextSet = useCallback(() => {
    setCurrentSet((current) => {
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
    setCurrentStep((current) => (current + 1 < steps.length ? current + 1 : -1));
  }, [currentSet, setCurrentStep, stepSets]);

  const previousStep = useCallback(() => {
    setCurrentStep((current) => (current > 0 ? current - 1 : current));
  }, [setCurrentStep]);

  const onComplete = useCallback(() => {
    onboardingSetComplete(true);
    onboardingStorage.set({ complete: true });
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

  const toggleMinimized = useCallback(() => setMinimized((minimized) => !minimized), [setMinimized]);

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

  return complete ? null : (
    <OnboardingContext.Provider value={value}>
      <WelcomeModal />
      <TeachingBubbles />
    </OnboardingContext.Provider>
  );
};

export default Onboarding;
