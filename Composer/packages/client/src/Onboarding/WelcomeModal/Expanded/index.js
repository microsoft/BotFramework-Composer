// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useContext } from 'react';
import formatMessage from 'format-message';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { IconButton, PrimaryButton } from 'office-ui-fabric-react';

import OnboardingContext from '../../context';

import {
  buttonStyle,
  contentStyle,
  headerStyle,
  footerStyle,
  statusStyle,
  subtitleStyle,
  titleStyle,
  topBarStyle,
} from './styles';
import welcomeImage from './welcome.png';

const StepStatus = ({ isComplete, steps = 0, title }) => (
  <div css={statusStyle}>
    <Icon className={isComplete && 'completed'} iconName={isComplete ? 'SkypeCircleCheck' : 'NavigateForward'} />
    {title}
    {!!steps && (
      <span>
        &nbsp;({steps} {steps > 1 ? formatMessage('tips') : formatMessage('tip')})
      </span>
    )}
  </div>
);

const WelcomeModal = () => {
  const {
    actions: { exit, nextSet, onComplete, toggleMinimized },
    state: { currentSet, currentStep, stepSets },
  } = useContext(OnboardingContext);

  return (
    <div css={contentStyle}>
      <div css={headerStyle}>
        <div css={topBarStyle}>
          <div css={titleStyle}>{formatMessage('Welcome!')}</div>
          <div css={buttonStyle}>
            <IconButton iconProps={{ iconName: 'ChromeMinimize' }} onClick={toggleMinimized} title="Collapse" />
            <IconButton iconProps={{ iconName: 'ChromeClose' }} onClick={exit} title="Close" />
          </div>
        </div>
        <img src={welcomeImage} alt="Welcome" />
        <div css={subtitleStyle}>{formatMessage('Your bot creation journey on Composer')}</div>
      </div>
      <div>
        {stepSets.map(({ steps: { length }, title }, index) => (
          <StepStatus
            key={index}
            isComplete={index < currentSet || (index === currentSet && !~currentStep)}
            steps={length}
            title={title}
          />
        ))}
      </div>
      <div css={footerStyle}>
        {!~currentStep && (
          <div>
            {currentSet + 1 < stepSets.length && (
              <PrimaryButton data-testid="onboardingNextSet" onClick={nextSet} text={stepSets[currentSet + 1].title} />
            )}
            {currentSet + 1 === stepSets.length && (
              <PrimaryButton data-testid="onboardingDone" text={formatMessage('Done!')} onClick={onComplete} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeModal;
