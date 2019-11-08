// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useContext, useEffect, useState, useRef } from 'react';
import formatMessage from 'format-message';
import debounce from 'lodash.debounce';
import { TeachingBubble } from 'office-ui-fabric-react/lib/TeachingBubble';

import OnboardingContext from '../context';
import { getTeachingBubble } from '../onboarding';
import { StoreContext } from '../../store';

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
  const {
    state: {
      onboarding: { coachMarkRefs },
    },
  } = useContext(StoreContext);

  const {
    actions: { nextStep, previousStep },
    state: { currentStep, teachingBubble },
  } = useContext(OnboardingContext);

  // Since some of the teaching bubbles are positioned with (x, y) coordinates relative
  // to the extension they exist in and we get the (left, top) position of the extension
  // to position the bubble relative to the app, we need to re-render the teaching bubble
  // when the screen is resized.
  const [, forceRender] = useState();
  const rerender = useRef(debounce(() => forceRender({}), 200)).current;

  useEffect(() => {
    window.addEventListener('resize', rerender);
    return () => window.removeEventListener('resize', rerender);
  }, [forceRender]);

  const { id, location, setLength = 0, targetId = '' } = teachingBubble || {};
  const target = coachMarkRefs[targetId];

  if (!target) {
    return null;
  }

  // The teaching bubbles attach themselves to elements in Composer with component refs.
  // However, the `actions` teaching bubble attaches itself to an element in the Visual
  // Editor, and we can't access the component ref in the iFrame from the app. As a
  // workaround, the extension adds an (x, y) coordinate to the `coachMarkRefs` map where
  // the teaching bubble should be positioned relative to the extension. We can then
  // add the `top` and `left` position of the extension to position the teaching bubble
  // relative to the app.
  let position;
  const { x, y } = target;

  if (typeof x !== 'undefined' && typeof y !== 'undefined' && location) {
    const extension = coachMarkRefs[location];
    const { left = 0, top = 0 } = (extension && extension.getBoundingClientRect()) || {};
    position = { x: left + x, y: top + y };
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
