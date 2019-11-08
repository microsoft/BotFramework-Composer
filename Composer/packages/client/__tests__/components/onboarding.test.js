// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from 'react-testing-library';

import OnboardingContext from '../../src/Onboarding/context';
import { StoreContext } from '../../src/store';
import TeachingBubbles from '../../src/Onboarding/TeachingBubbles';
import { stepSets as defaultStepSets } from '../../src/Onboarding/onboarding';
import WelcomeModal from '../../src/Onboarding/WelcomeModal';

describe('<Onboarding />', () => {
  let value;
  let onboardingValue;

  const stepSets = defaultStepSets().map(stepSet => ({
    ...stepSet,
    steps: stepSet.steps.map(step => ({ ...step, targetId: 'test', location: 'VisualDesigner' })),
  }));

  beforeEach(() => {
    value = {
      state: {
        onboarding: {
          coachMarkRefs: {
            test: { x: 0, y: 0 },
            VisualDesigner: {
              getBoundingClientRect: () => ({ top: 0, left: 0 }),
            },
          },
        },
      },
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
      const { baseElement } = render(
        <StoreContext.Provider value={value}>
          <OnboardingContext.Provider value={onboardingValue}>
            <TeachingBubbles />
          </OnboardingContext.Provider>
        </StoreContext.Provider>
      );
      expect(baseElement).toHaveTextContent('Get started!');
    });
  });

  describe('<WelcomeModal />', () => {
    it('renders expanded Welcome Modal', async () => {
      const { findByText } = render(
        <StoreContext.Provider value={value}>
          <OnboardingContext.Provider value={onboardingValue}>
            <WelcomeModal />
          </OnboardingContext.Provider>
        </StoreContext.Provider>
      );

      for (const { title } of stepSets) {
        await findByText(title);
      }
    });

    it('renders the collapsed Welcome Modal', async () => {
      onboardingValue.state.minimized = true;
      const { findByText } = render(
        <StoreContext.Provider value={value}>
          <OnboardingContext.Provider value={onboardingValue}>
            <WelcomeModal />
          </OnboardingContext.Provider>
        </StoreContext.Provider>
      );
      await findByText('Welcome');
    });
  });
});
