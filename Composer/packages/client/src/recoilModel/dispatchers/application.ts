/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface } from 'recoil';
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

export const applicationDispatcher = {
  setAppUpdateStatus: ({ set, snapshot: { getPromise } }: CallbackInterface) => async (
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
  },
  setAppUpdateShowing: ({ set }: CallbackInterface) => (isShowing: boolean) => {
    set(appUpdateState, (updaterState) => {
      return {
        ...updaterState,
        showing: isShowing,
      };
    });
  },

  setAppUpdateError: ({ set }: CallbackInterface) => (error: any) => {
    set(appUpdateState, (updaterState) => {
      return {
        ...updaterState,
        error: error,
      };
    });
  },

  setAppUpdateProgress: ({ set }: CallbackInterface) => (progressPercent: number, downloadSizeInBytes: number) => {
    set(appUpdateState, (updaterState: AppUpdateState) => {
      return {
        ...updaterState,
        progressPercent,
        downloadSizeInBytes,
      };
    });
  },

  setMessage: ({ set }: CallbackInterface) =>
    debounce((message: string) => {
      set(announcementState, message);
    }, 500),

  onboardingAddCoachMarkRef: ({ set }: CallbackInterface) => (coachMarkRef: { [key: string]: any }) => {
    set(onboardingState, (onboardingObj) => ({
      ...onboardingObj,
      coachMarkRefs: {
        ...onboardingObj.coachMarkRefs,
        ...coachMarkRef,
      },
    }));
  },

  onboardingSetComplete: ({ set }: CallbackInterface) => (isComplete: boolean) => {
    set(onboardingState, (onboardingObj) => ({
      ...onboardingObj,
      complete: isComplete,
    }));
    OnboardingState.setComplete(isComplete);
  },

  setCreationFlowStatus: ({ set }: CallbackInterface) => (status: CreationFlowStatus) => {
    set(creationFlowStatusState, status);
  },

  setApplicationLevelError: ({ set }: CallbackInterface) => (errorObj: StateError | undefined) => {
    set(applicationErrorState, errorObj);
  },
};
