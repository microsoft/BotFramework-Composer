// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useContext, useState, useEffect, useCallback } from 'react';
import formatMessage from 'format-message';
import { TeachingBubble } from 'office-ui-fabric-react/lib/TeachingBubble';

import OnboardingContext from '../context';
import { StoreContext } from '../../store';
import { getTeachingBubble } from '../onboarding';

import { teachingBubbleStyles, teachingBubbleTheme } from './styles';

const TeachingBubbles = () => {
  const [, forceRender] = useState();

  const rerender = useCallback(() => forceRender({}), [forceRender]);

  useEffect(() => {
    window.addEventListener('resize', rerender);
    return () => window.removeEventListener('resize', rerender);
  }, [forceRender]);

  const {
    state: {
      onboarding: { coachMarkRefs },
    },
  } = useContext(StoreContext);

  const {
    actions: { nextStep, previousStep },
    state: { currentSet, currentStep, teachingBubble },
  } = useContext(OnboardingContext);

  const { id, location, setLength = 0, targetId = '' } = teachingBubble || {};

  const target = coachMarkRefs[targetId];

  if (!target) {
    return null;
  }

  // The teaching bubbles attach themselves to elements in Composer with component refs.
  // However, the `actions` teaching bubble attaches itself to an element in the Visual
  // Editor, and we can't access the component ref in the iFrame from the app. As a
  // workaround, the extension adds an xy-coordinate to the `coachMarkRefs` map where
  // the teaching bubble should be positioned relative to the extension. We can then
  // add the `top` and `left` position of the extension to position the teaching bubble
  // relative to the app.
  let position;
  const { x, y } = target;

  if (x && y && location) {
    const { left, top } = coachMarkRefs[location].getBoundingClientRect();
    position = { x: left + x, y: top + y };
  }

  const teachingBubbleProps = getTeachingBubble(id);

  teachingBubbleProps.primaryButtonProps = {
    children:
      setLength > 1
        ? currentStep === setLength - 1
          ? formatMessage('Done')
          : formatMessage('Next')
        : formatMessage('Got it!'),
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

  if (currentSet === 0) {
    teachingBubbleProps.onDismiss = nextStep;
  }

  if (setLength > 1) {
    teachingBubbleProps.footerContent = `${currentStep + 1} ${formatMessage('of')} ${setLength}`;
  }

  return target ? (
    <TeachingBubble
      styles={teachingBubbleStyles}
      target={position || target}
      theme={teachingBubbleTheme}
      {...teachingBubbleProps}
    />
  ) : null;
};

export default TeachingBubbles;
