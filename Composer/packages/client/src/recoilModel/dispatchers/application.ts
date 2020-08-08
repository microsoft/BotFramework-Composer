/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface, useRecoilCallback } from 'recoil';
import debounce from 'lodash/debounce';

import { appUpdateState, announcementState, onboardingState, creationFlowStatusState } from '../atoms/appState';
import { AppUpdaterStatus, CreationFlowStatus } from '../../constants';
import OnboardingState from '../../utils/onboardingStorage';
import { StateError, AppUpdateState } from '../../recoilModel/types';

import { setError } from './shared';

export const applicationDispatcher = () => {
  const setAppUpdateStatus = useRecoilCallback(
    ({ set }: CallbackInterface) => (status: AppUpdaterStatus, version: string | undefined) => {
      set(appUpdateState, (currentAppUpdate) => {
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

  const setApplicationLevelError = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => (errorObj: StateError | undefined) => {
      setError(callbackHelpers, errorObj);
    }
  );

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
