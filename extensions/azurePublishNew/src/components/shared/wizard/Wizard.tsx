// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import styled from '@emotion/styled';
import { DefaultButton } from 'office-ui-fabric-react';
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
  title: any;
  subTitle?: any;
  navigationState?: WizardNavigationState;
  onNext?: (step?: WizardStep) => void;
  onRenderContent: (step: WizardStep) => React.ReactNode;
  onCancel?: (step?: WizardStep) => void;
  onBack?: (step?: WizardStep) => void;
  getNextStepId?: () => string | undefined;
  getBackStepId?: () => string | undefined;
};

export type Props = {
  steps: WizardStep[];
  firstStepId?: string;
  navigationState?: WizardNavigationState;
  onRenderHeader?: (step: WizardStep) => React.ReactNode;
  onRenderFooter?: (step: WizardStep) => React.ReactNode;
  getNextStepId?: (currentStep: WizardStep) => string | undefined;
  getBackStepId?: (currentStep: WizardStep) => string | undefined;
  onStepChange?: (step: WizardStep, changeDirection: ChangeDirection) => void;
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
`;
const Content = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 430px;
  height: calc(100vh - 65px);
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
  const [currentStepId, setCurrentStepId] = React.useState<string>(
    firstStepId || (steps.length > 0 ? steps[0].id : '')
  );

  const stepIndex = React.useMemo(() => {
    return steps.findIndex((step) => step.id === currentStepId);
  }, [steps, currentStepId]);

  const currentStep = React.useMemo(() => {
    return stepIndex >= 0 && stepIndex < steps.length ? steps[stepIndex] : undefined;
  }, [stepIndex, steps]);

  const onNextClick = React.useCallback(() => {
    let nextStepId: string | undefined = undefined;
    let nextStep: WizardStep | undefined = undefined;

    // step chooses first
    if (currentStep?.getNextStepId) {
      nextStepId = currentStep.getNextStepId();
    }

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
    nextStep && onStepChange?.(nextStep, 'next');
  }, [currentStep]);

  const onBackClick = React.useCallback(() => {
    let backStepId: string | undefined = undefined;
    let backStep: WizardStep | undefined = undefined;

    if (currentStep?.getBackStepId) {
      backStepId = currentStep.getBackStepId();
    }
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
    backStep && onStepChange?.(backStep, 'back');
  }, [currentStep]);

  const onCancelClick = () => {};

  const defaultNavigationState = React.useMemo<WizardNavigationState>(() => {
    return {
      showBack: stepIndex > 0,
      backText: 'Back',
      canGoBack: stepIndex > 0,
      nextText: 'Next',
      canGoNext: stepIndex < steps.length,
      showCancel: true,
      cancelText: 'Cancel',
      canCancel: true,
    };
  }, [steps, stepIndex]);

  const navigationState = React.useMemo(() => {
    return {
      ...defaultNavigationState,
      ...wizardNavigationState,
      ...currentStep?.navigationState,
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
  }, [currentStep, navigationState]);

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
