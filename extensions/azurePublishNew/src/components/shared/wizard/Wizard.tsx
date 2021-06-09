// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import styled from '@emotion/styled';
import { DefaultButton } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

export type WizardNavigationState = {
  nextText?: string;
  canGoNext?: boolean;
  showBack?: boolean;
  backText?: string;
  canGoBack?: boolean;
  showCancel?: boolean;
  cancelText?: string;
  canCancel?: boolean;
};

export type ChangeDirection = 'next' | 'back';

export type WizardStep = {
  id: string;
  title: React.ReactNode;
  subTitle?: React.ReactNode;
  navigationState?: WizardNavigationState;
  onNext?: (step?: WizardStep) => void;
  onRenderContent: (step: WizardStep) => React.ReactNode;
  onCancel?: (step?: WizardStep) => void;
  onBack?: (step?: WizardStep) => void;
  getNextStepId?: () => string | undefined;
  getBackStepId?: () => string | undefined;
};

type Props = {
  steps: WizardStep[];
  firstStepId?: string;
  navigationState?: WizardNavigationState;
  onRenderHeader?: (step: WizardStep) => React.ReactNode;
  onRenderFooter?: (step: WizardStep) => React.ReactNode;
  getNextStepId?: (currentStep: WizardStep) => string | undefined;
  getBackStepId?: (currentStep: WizardStep) => string | undefined;
  onStepChange?: (stepIndex: number, step: WizardStep, changeDirection: ChangeDirection) => void;
};

const Footer = styled.div`
  flex: auto;
  flex-grow: 0;
  background: #ffffff;
  border-top: 1px solid #edebe9;
  width: 100%;
  text-align: right;
  height: fit-content;
  padding: 24px 0px 0px;
  grid-column: span 2;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 430px;
`;

const FooterButton = styled(DefaultButton)`
  margin: 0 4px;
`;

export const Wizard = (props: Props) => {
  const {
    steps,
    firstStepId,
    navigationState: wizardNavigationState,
    getNextStepId,
    onStepChange,
    onRenderFooter,
    onRenderHeader,
  } = props;
  const [currentStepId, setCurrentStepId] = React.useState<string>('');

  React.useEffect(() => {
    !currentStepId && setCurrentStepId(firstStepId ?? steps[0]?.id);
  }, [firstStepId, steps]);

  const stepIndex = React.useMemo(() => {
    return steps.findIndex((step) => step.id === currentStepId);
  }, [steps, currentStepId]);

  const currentStep = React.useMemo(() => steps[stepIndex], [steps, stepIndex]);

  const onNextClick = React.useCallback(() => {
    let nextStepId: string | undefined = undefined;
    let nextStep: WizardStep | undefined = undefined;

    // step chooses first
    nextStepId = currentStep?.getNextStepId?.();

    // caller chooses next
    if (currentStep && !nextStepId && getNextStepId) {
      nextStepId = getNextStepId(currentStep);
    }

    // otherwise, the next step in the sequence
    if (!nextStepId && stepIndex < steps.length - 1) {
      nextStep = steps[stepIndex + 1];
      nextStepId = nextStep.id;
    }

    if (nextStepId && !nextStep) {
      nextStep = steps.find((step) => step.id === nextStepId);
    }

    if (currentStep && nextStep) {
      setCurrentStepId(nextStep.id);
    }
    currentStep?.onNext?.(nextStep);
    nextStep && onStepChange?.(stepIndex + 1, nextStep, 'next');
  }, [currentStep, onStepChange]);

  const onBackClick = React.useCallback(() => {
    let backStepId: string | undefined = undefined;
    let backStep: WizardStep | undefined = undefined;

    backStepId = currentStep?.getBackStepId?.();

    if (currentStep && !backStepId && currentStep?.getBackStepId) {
      backStepId = getNextStepId(currentStep);
    }
    if (!backStepId && stepIndex > 0) {
      backStep = steps[stepIndex - 1];
      backStepId = backStep.id;
    }
    if (backStepId && !backStep) {
      backStep = steps.find((step) => step.id === backStepId);
    }
    if (currentStep && backStep) {
      setCurrentStepId(backStep.id);
    }
    currentStep?.onBack?.(backStep);
    backStep && onStepChange?.(stepIndex - 1, backStep, 'back');
  }, [currentStep, onStepChange]);

  const onCancelClick = () => {};

  const defaultNavigationState = React.useMemo<WizardNavigationState>(() => {
    return {
      showBack: stepIndex > 0,
      backText: formatMessage('Back'),
      canGoBack: stepIndex > 0,
      nextText: formatMessage('Next'),
      canGoNext: stepIndex < steps.length,
      showCancel: true,
      cancelText: formatMessage('Cancel'),
      canCancel: true,
    };
  }, [steps, stepIndex]);

  const navigationState = React.useMemo(() => {
    return {
      ...defaultNavigationState,
      ...wizardNavigationState,
      ...currentStep?.navigationState,
      canGoBack: !!currentStep?.onBack || defaultNavigationState.canGoBack,
      showBack: !!currentStep?.onBack || defaultNavigationState.canGoBack,
    };
  }, [currentStep, wizardNavigationState, defaultNavigationState]);

  const step = React.useMemo(() => {
    return {
      ...currentStep,
      navigationState: navigationState,
      onNext: onNextClick,
      onBack: onBackClick,
      onCancel: onCancelClick,
    };
  }, [currentStep, navigationState, onNextClick, onBackClick, onCancelClick]);

  return (
    <>
      {onRenderHeader ? (
        onRenderHeader(step)
      ) : (
        <div>
          <div>{currentStep?.title}</div>
          <div>{currentStep?.subTitle}</div>
        </div>
      )}
      <Content>{currentStep?.onRenderContent(step)}</Content>
      <Footer>
        {onRenderFooter != null ? (
          onRenderFooter(step)
        ) : (
          <div>
            {navigationState.showBack && (
              <FooterButton disabled={!navigationState.canGoBack} onClick={onBackClick}>
                {navigationState.backText}
              </FooterButton>
            )}
            <FooterButton disabled={!navigationState.canGoNext} onClick={onNextClick}>
              {navigationState.nextText}
            </FooterButton>
            <FooterButton disabled={!navigationState.canCancel} onClick={onCancelClick}>
              {navigationState.cancelText}
            </FooterButton>
          </div>
        )}
      </Footer>
    </>
  );
};
