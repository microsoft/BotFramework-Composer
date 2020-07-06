/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface, useRecoilCallback } from 'recoil';
import debounce from 'lodash/debounce';

import {
  appUpdateState,
  announcementState,
  onboardingState,
  creationFlowStatusState,
  applicationErrorState,
} from '../atoms/appState';
import { AppUpdaterStatus, CreationFlowStatus } from '../../constants';
import OnboardingState from '../../utils/onboardingStorage';
import { StateError, AppUpdateState } from '../../recoilModel/types';

export const setAppUpdateStatusBase = ({ set, snapshot: { getPromise } }: CallbackInterface) => async (
  status: AppUpdaterStatus,
  version: string | undefined
) => {
  const currentAppUpdate = await getPromise(appUpdateState);
  const newAppUpdateState = {
    ...currentAppUpdate,
  };
  if (status === AppUpdaterStatus.UPDATE_AVAILABLE) {
    newAppUpdateState.version = version;
  }
  if (status === AppUpdaterStatus.IDLE) {
    newAppUpdateState.progressPercent = 0;
    newAppUpdateState.version = undefined;
  }
  set(appUpdateState, {
    ...newAppUpdateState,
  });
};

export const setAppUpdateShowingBase = ({ set }: CallbackInterface) => (isShowing: boolean) => {
  set(appUpdateState, (updaterState) => {
    return {
      ...updaterState,
      showing: isShowing,
    };
  });
};

export const setAppUpdateErrorBase = ({ set }: CallbackInterface) => (error: any) => {
  set(appUpdateState, (updaterState) => {
    return {
      ...updaterState,
      error: error,
    };
  });
};

export const setAppUpdateProgressBase = ({ set }: CallbackInterface) => (
  progressPercent: number,
  downloadSizeInBytes: number
) => {
  set(appUpdateState, (updaterState: AppUpdateState) => {
    return {
      ...updaterState,
      progressPercent,
      downloadSizeInBytes,
    };
  });
};

export const setMessageBase = ({ set }: CallbackInterface) => (message: string) => {
  set(announcementState, message);
};

export const onboardingAddCoachMarkRefBase = ({ set }: CallbackInterface) => (coachMarkRef: { [key: string]: any }) => {
  set(onboardingState, (onboardingObj) => ({
    ...onboardingObj,
    coachMarkRefs: {
      ...onboardingObj.coachMarkRefs,
      ...coachMarkRef,
    },
  }));
};

export const onboardingSetCompleteBase = ({ set }: CallbackInterface) => (isComplete: boolean) => {
  set(onboardingState, (onboardingObj) => ({
    ...onboardingObj,
    complete: isComplete,
  }));
  OnboardingState.setComplete(isComplete);
};

export const setCreationFlowStatusBase = ({ set }: CallbackInterface) => (status: CreationFlowStatus) => {
  set(creationFlowStatusState, status);
};

export const setApplicationLevelErrorBase = ({ set }: CallbackInterface) => (errorObj: StateError | undefined) => {
  set(applicationErrorState, errorObj);
};

export const applicationDispatcher = () => {
  const setAppUpdateStatus = useRecoilCallback<[AppUpdaterStatus, string | undefined], Promise<void>>(
    setAppUpdateStatusBase
  );

  const setAppUpdateShowing = useRecoilCallback<[boolean], void>(setAppUpdateShowingBase);

  const setAppUpdateError = useRecoilCallback<[any], void>(setAppUpdateErrorBase);

  const setAppUpdateProgress = useRecoilCallback<[number, number], void>(setAppUpdateProgressBase);

  const setMessage = useRecoilCallback<[string], void>(setMessageBase);

  const onboardingAddCoachMarkRef = useRecoilCallback<[{ [key: string]: any }], void>(onboardingAddCoachMarkRefBase);

  const onboardingSetComplete = useRecoilCallback<[boolean], void>(onboardingSetCompleteBase);

  const setCreationFlowStatus = useRecoilCallback<[CreationFlowStatus], void>(setCreationFlowStatusBase);

  const setApplicationLevelError = useRecoilCallback<[StateError | undefined], void>(setApplicationLevelErrorBase);

  return {
    setAppUpdateStatus,
    setAppUpdateShowing,
    setAppUpdateError,
    setAppUpdateProgress,
    setMessage: debounce(setMessage, 500),
    onboardingSetComplete,
    onboardingAddCoachMarkRef,
    setCreationFlowStatus,
    setApplicationLevelError,
  };
};
