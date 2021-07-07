/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface, useRecoilCallback } from 'recoil';
import debounce from 'lodash/debounce';
import formatMessage from 'format-message';

import {
  appUpdateState,
  announcementState,
  onboardingState,
  creationFlowStatusState,
  PageMode,
  creationFlowTypeState,
  pageElementState,
  debugPanelExpansionState,
  debugPanelActiveTabState,
  userHasNodeInstalledState,
  applicationErrorState,
  surveyEligibilityState,
  machineInfoState,
  showGetStartedTeachingBubbleState,
  showErrorDiagnosticsState,
  showWarningDiagnosticsState,
  projectsForDiagnosticsFilterState,
} from '../atoms/appState';
import {
  AppUpdaterStatus,
  CreationFlowStatus,
  CreationFlowType,
  SURVEY_EPOCH_KEY,
  SURVEY_PARAMETERS,
} from '../../constants';
import OnboardingState from '../../utils/onboardingStorage';
import { StateError, AppUpdateState, MachineInfo } from '../../recoilModel/types';
import { DebugDrawerKeys } from '../../pages/design/DebugPanel/TabExtensions/types';
import httpClient from '../../utils/httpUtil';
import { ClientStorage } from '../../utils/storage';

import { setError } from './shared';
import { flushExistingTasks } from './utils/project';

export const applicationDispatcher = () => {
  const setAppUpdateStatus = useRecoilCallback(
    ({ set }: CallbackInterface) => (status: AppUpdaterStatus, version: string | undefined) => {
      set(appUpdateState, (currentAppUpdate) => {
        const newAppUpdateState = {
          ...currentAppUpdate,
        };
        if (status === AppUpdaterStatus.UPDATE_AVAILABLE || status === AppUpdaterStatus.BREAKING_UPDATE_AVAILABLE) {
          newAppUpdateState.version = version;
        }
        if (status === AppUpdaterStatus.IDLE) {
          newAppUpdateState.progressPercent = 0;
          newAppUpdateState.version = undefined;
        }

        newAppUpdateState.status = status;

        return newAppUpdateState;
      });
    }
  );

  const setAppUpdateShowing = useRecoilCallback(({ set }: CallbackInterface) => (isShowing: boolean) => {
    set(appUpdateState, (updaterState) => {
      return {
        ...updaterState,
        showing: isShowing,
      };
    });
  });

  const setAppUpdateError = useRecoilCallback(({ set }: CallbackInterface) => (error: any) => {
    set(appUpdateState, (updaterState) => {
      return {
        ...updaterState,
        error,
      };
    });
  });

  const setAppUpdateProgress = useRecoilCallback(
    ({ set }: CallbackInterface) => (progressPercent: number, downloadSizeInBytes: number) => {
      set(appUpdateState, (updaterState: AppUpdateState) => {
        return {
          ...updaterState,
          progressPercent,
          downloadSizeInBytes,
        };
      });
    }
  );

  const setMessage = useRecoilCallback(({ set }: CallbackInterface) => (message: string) => {
    set(announcementState, message);
  });

  const setPageElementState = useRecoilCallback(({ set }: CallbackInterface) => (mode: PageMode, settings: {}) => {
    set(pageElementState, (currentElementState) => ({
      ...currentElementState,
      [mode]: settings,
    }));
  });

  const onboardingAddCoachMarkRef = useRecoilCallback(
    ({ set }: CallbackInterface) => (coachMarkRef: { [key: string]: any }) => {
      set(onboardingState, (onboardingObj) => ({
        ...onboardingObj,
        coachMarkRefs: {
          ...onboardingObj.coachMarkRefs,
          ...coachMarkRef,
        },
      }));
    }
  );

  const onboardingSetComplete = useRecoilCallback(({ set }: CallbackInterface) => (isComplete: boolean) => {
    set(onboardingState, (onboardingObj) => ({
      ...onboardingObj,
      complete: isComplete,
    }));
    OnboardingState.setComplete(isComplete);
  });

  const setCreationFlowStatus = useRecoilCallback(({ set }: CallbackInterface) => (status: CreationFlowStatus) => {
    set(creationFlowStatusState, status);
  });

  const setCreationFlowType = useRecoilCallback(({ set }: CallbackInterface) => (type: CreationFlowType) => {
    set(creationFlowTypeState, type);
  });

  const setApplicationLevelError = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => (errorObj: StateError | undefined) => {
      setError(callbackHelpers, errorObj);
    }
  );

  const setDebugPanelExpansion = useRecoilCallback(({ set }: CallbackInterface) => (isExpanded: boolean) => {
    set(debugPanelExpansionState, isExpanded);
  });

  const setActiveTabInDebugPanel = useRecoilCallback(
    ({ set }: CallbackInterface) => (activeTab: DebugDrawerKeys | undefined) => {
      set(debugPanelActiveTabState, activeTab);
    }
  );

  const checkNodeVersion = useRecoilCallback(({ set }: CallbackInterface) => async () => {
    try {
      const response = await httpClient.get(`/utilities/checkNode`);
      const userHasNode = response.data?.userHasNode;
      set(userHasNodeInstalledState, userHasNode);
    } catch (err) {
      set(applicationErrorState, {
        message: formatMessage('Error checking node version'),
        summary: err.message,
      });
    }
  });

  const performAppCleanupOnQuit = useRecoilCallback((callbackHelpers: CallbackInterface) => async () => {
    // shutdown any running bots to avoid orphaned processes
    await flushExistingTasks(callbackHelpers);
  });

  const setSurveyEligibility = useRecoilCallback(({ set }: CallbackInterface) => () => {
    const surveyStorage = new ClientStorage(window.localStorage, 'survey');

    const optedOut = surveyStorage.get('optedOut', false);
    if (optedOut) {
      set(surveyEligibilityState, false);
      return;
    }

    let days = surveyStorage.get('days', 0);
    const lastUsed = surveyStorage.get('dateLastUsed', null);
    const lastTaken = surveyStorage.get(SURVEY_EPOCH_KEY, null);
    const today = new Date().toDateString();
    if (lastUsed !== today) {
      days += 1;
      surveyStorage.set('days', days);
    }
    if (
      // To be eligible for the survey, the user needs to have used Composer
      // some minimum number of days.
      days >= SURVEY_PARAMETERS.daysUntilEligible &&
      // Also, either the user must have never taken the survey before or
      // the last time they took it must be long enough in the past.
      (lastTaken == null || Date.now() - lastTaken > SURVEY_PARAMETERS.timeUntilNextSurvey)
    ) {
      // If the above conditions are true, there's a fixed chance the card will appear.
      set(surveyEligibilityState, Math.random() < SURVEY_PARAMETERS.chanceToAppear);
    }
    surveyStorage.set('dateLastUsed', today);
  });

  const setMachineInfo = useRecoilCallback((callbackHelpers: CallbackInterface) => (info: MachineInfo) => {
    callbackHelpers.set(machineInfoState, info);
  });

  const setShowGetStartedTeachingBubble = useRecoilCallback((callbackHelpers: CallbackInterface) => (show: boolean) => {
    callbackHelpers.set(showGetStartedTeachingBubbleState, show);
  });

  const setErrorDiagnosticsFilter = useRecoilCallback(({ set }: CallbackInterface) => (value: boolean) => {
    set(showErrorDiagnosticsState, value);
  });

  const setWarningDiagnosticsFilter = useRecoilCallback(({ set }: CallbackInterface) => (value: boolean) => {
    set(showWarningDiagnosticsState, value);
  });

  const setProjectsForDiagnosticsFilter = useRecoilCallback(({ set }: CallbackInterface) => (projectIds: string[]) => {
    set(projectsForDiagnosticsFilterState, projectIds);
  });

  return {
    checkNodeVersion,
    setAppUpdateStatus,
    setAppUpdateShowing,
    setAppUpdateError,
    setAppUpdateProgress,
    setMessage: debounce(setMessage, 500),
    onboardingSetComplete,
    onboardingAddCoachMarkRef,
    performAppCleanupOnQuit,
    setCreationFlowStatus,
    setApplicationLevelError,
    setCreationFlowType,
    setPageElementState,
    setDebugPanelExpansion,
    setActiveTabInDebugPanel,
    setSurveyEligibility,
    setMachineInfo,
    setShowGetStartedTeachingBubble,
    setErrorDiagnosticsFilter,
    setWarningDiagnosticsFilter,
    setProjectsForDiagnosticsFilter,
  };
};
