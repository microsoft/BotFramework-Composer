// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useState, useRef } from 'react';
import formatMessage from 'format-message';
import debounce from 'lodash/debounce';
import { TeachingBubble } from 'office-ui-fabric-react/lib/TeachingBubble';
import { useRecoilValue } from 'recoil';
import { FluentTheme } from '@uifabric/fluent-theme';
import { ITeachingBubbleStyles } from 'office-ui-fabric-react/lib/TeachingBubble';

import { onboardingState } from '../recoilModel';

import { useOnboardingContext } from './OnboardingContext';
import { getTeachingBubble } from './content';

export const teachingBubbleStyles: Partial<ITeachingBubbleStyles> = {
  bodyContent: {
    selectors: {
      a: {
        color: FluentTheme.palette.white,
      },
    },
  },
};

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
  } = useOnboardingContext();

  const [, forceRender] = useState<object>();
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
      {...teachingBubbleProps}
      calloutProps={{
        preventDismissOnLostFocus: true,
        preventDismissOnResize: true,
        preventDismissOnScroll: true,
        ...teachingBubbleProps.calloutProps,
      }}
    />
  );
};

export default TeachingBubbles;
