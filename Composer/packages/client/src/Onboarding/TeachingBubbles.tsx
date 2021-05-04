// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useState, useRef } from 'react';
import formatMessage from 'format-message';
import debounce from 'lodash/debounce';
import { TeachingBubble } from 'office-ui-fabric-react/lib/TeachingBubble';
import { useRecoilValue } from 'recoil';
import { FluentTheme } from '@uifabric/fluent-theme';
import { ITeachingBubbleStyles } from 'office-ui-fabric-react/lib/TeachingBubble';
import { ILinkStyles, Link } from 'office-ui-fabric-react/lib/components/Link';

import TelemetryClient from '../telemetry/TelemetryClient';
import { onboardingState } from '../recoilModel';

import { useOnboardingContext } from './OnboardingContext';
import { getTeachingBubble } from './content';

const teachingBubbleStyles: Partial<ITeachingBubbleStyles> = {
  bodyContent: {
    selectors: {
      a: {
        color: FluentTheme.palette.white,
      },
    },
  },
};

const linkStyles: Partial<ILinkStyles> = {
  root: {
    textDecoration: 'underline',
    selectors: {
      ':hover': {
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

  const { content, headline, helpLink, calloutProps } = getTeachingBubble(id);

  const primaryButtonProps = {
    children: getPrimaryButtonText(currentStep, setLength),
    onClick: nextStep,
    'data-testid': 'onboardingNext',
  };

  let secondaryButtonProps;
  if (currentStep > 0) {
    secondaryButtonProps = {
      children: formatMessage('Previous'),
      onClick: previousStep,
      'data-testid': 'onboardingPrevious',
    };
  }

  let footerContent;
  if (setLength > 1) {
    footerContent = `${formatMessage('{step} of {setLength}', {
      step: currentStep + 1,
      setLength,
    })}`;
  }

  let onDismiss;
  if (currentSet === 0) {
    onDismiss = nextStep;
  }

  return (
    <TeachingBubble
      calloutProps={{
        preventDismissOnLostFocus: true,
        preventDismissOnResize: true,
        preventDismissOnScroll: true,
        ...calloutProps,
      }}
      footerContent={footerContent}
      headline={headline}
      primaryButtonProps={primaryButtonProps}
      secondaryButtonProps={secondaryButtonProps}
      styles={teachingBubbleStyles}
      target={target}
      onDismiss={onDismiss}
    >
      {content}
      {helpLink && headline && (
        <>
          &nbsp;
          <Link
            aria-label={formatMessage('Learn more about {title}', { title: headline.toLowerCase() })}
            href={helpLink}
            rel="noopener noreferrer"
            styles={linkStyles}
            target="_blank"
            onClick={() => {
              TelemetryClient.track('HelpLinkClicked', { url: helpLink });
            }}
          >
            {formatMessage('Learn more')}
          </Link>
        </>
      )}
    </TeachingBubble>
  );
};

export default TeachingBubbles;
