// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import OnboardingContext from '../../src/Onboarding/OnboardingContext';
import TeachingBubbles from '../../src/Onboarding/TeachingBubbles/TeachingBubbles';
import WelcomeModal from '../../src/Onboarding/WelcomeModal/WelcomeModal';
import { renderWithRecoil } from '../testUtils';
import { onboardingState } from '../../src/recoilModel';
import { stepSets as defaultStepSets } from '../../src/Onboarding/onboardingUtils';

describe('<Onboarding />', () => {
  let onboardingDefaultState;
  let onboardingValue;

  const stepSets = defaultStepSets('echo-123', '123').map((stepSet) => ({
    ...stepSet,
    steps: stepSet.steps.map((step) => ({ ...step, targetId: 'test', location: 'VisualDesigner' })),
  }));

  beforeEach(() => {
    onboardingDefaultState = ({ set }) => {
      set(onboardingState, {
        coachMarkRefs: {
          test: { x: 0, y: 0 },
          VisualDesigner: {
            getBoundingClientRect: () => ({ top: 0, left: 0 }),
          },
        },
        complete: false,
      });
    };

    onboardingValue = {
      actions: {
        nextStep: () => {},
        previousStep: () => {},
      },
      state: {
        complete: false,
        currentSet: 0,
        currentStep: 0,
        hideModal: false,
        minimized: false,
        stepSets,
        teachingBubble: stepSets[0].steps[0],
      },
    };
  });

  describe('<TeachingBubbles />', () => {
    it('renders Teaching Bubble', () => {
      const rendered = renderWithRecoil(
        <OnboardingContext.Provider value={onboardingValue}>
          <TeachingBubbles />
        </OnboardingContext.Provider>,
        onboardingDefaultState
      );
      expect(rendered.baseElement).toHaveTextContent('Get started!');
    });
  });

  describe('<WelcomeModal />', () => {
    it('renders expanded Welcome Modal', async () => {
      const { findByText } = renderWithRecoil(
        <OnboardingContext.Provider value={onboardingValue}>
          <WelcomeModal />
        </OnboardingContext.Provider>,
        onboardingDefaultState
      );

      for (const { title } of stepSets) {
        await findByText(title as string);
      }
    });

    it('renders the collapsed Welcome Modal', async () => {
      onboardingValue.state.minimized = true;
      const { findByText } = renderWithRecoil(
        <OnboardingContext.Provider value={onboardingValue}>
          <WelcomeModal />
        </OnboardingContext.Provider>,
        onboardingDefaultState
      );
      await findByText('Welcome');
    });
  });
});
