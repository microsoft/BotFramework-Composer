// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useContext, useEffect, useState, useRef } from 'react';
import formatMessage from 'format-message';
import debounce from 'lodash/debounce';
import { TeachingBubble } from 'office-ui-fabric-react/lib/TeachingBubble';
import { useRecoilValue } from 'recoil';

import { onboardingState } from '../../recoilModel';
import OnboardingContext from '../OnboardingContext';
import { getTeachingBubble } from '../onboardingUtils';

import { teachingBubbleStyles, teachingBubbleTheme } from './styles';

function getPrimaryButtonText(currentStep, setLength) {
  if (setLength > 1) {
    if (currentStep === setLength - 1) {
      return formatMessage('Done');
    }
    return formatMessage('Next');
  }
  return formatMessage('Got it!');
}

const TeachingBubbles = () => {
  const onboarding = useRecoilValue(onboardingState);
  const coachMarkRefs = onboarding.coachMarkRefs;

  const {
    actions: { nextStep, previousStep },
    state: { currentSet, currentStep, teachingBubble },
  } = useContext(OnboardingContext);

  const [, forceRender] = useState();
  const rerender = useRef(debounce(() => forceRender({}), 200)).current;

  useEffect(() => {
    window.addEventListener('resize', rerender);
    return () => window.removeEventListener('resize', rerender);
  }, [forceRender]);

  const { id, setLength = 0, targetId = '' } = teachingBubble || {};
  const target = coachMarkRefs[targetId];

  if (!target) {
    return null;
  }

  const teachingBubbleProps = getTeachingBubble(id);

  teachingBubbleProps.primaryButtonProps = {
    children: getPrimaryButtonText(currentStep, setLength),
    onClick: nextStep,
    'data-testid': 'onboardingNext',
  };

  if (currentStep > 0) {
    teachingBubbleProps.secondaryButtonProps = {
      children: formatMessage('Previous'),
      onClick: previousStep,
      'data-testid': 'onboardingPrevious',
    };
  }

  if (setLength > 1) {
    teachingBubbleProps.footerContent = `${formatMessage('{step} of {setLength}', {
      step: currentStep + 1,
      setLength,
    })}`;
  }

  if (currentSet === 0) {
    teachingBubbleProps.onDismiss = nextStep;
  }

  return (
    <TeachingBubble
      styles={teachingBubbleStyles}
      target={target}
      theme={teachingBubbleTheme}
      {...teachingBubbleProps}
    />
  );
};

export default TeachingBubbles;
