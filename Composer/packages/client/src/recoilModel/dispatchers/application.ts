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
import { StateError } from '../../store/types';

export const applicationDispatcher = () => {
  const setAppUpdateStatus = useRecoilCallback<[AppUpdaterStatus, string | undefined], Promise<void>>(
    ({ set, snapshot: { getPromise } }: CallbackInterface) => async (
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
    }
  );

  const setAppUpdateShowing = useRecoilCallback<[boolean], void>(
    ({ set }: CallbackInterface) => (isShowing: boolean) => {
      set(appUpdateState, (updaterState) => {
        return {
          ...updaterState,
          showing: isShowing,
        };
      });
    }
  );

  const setAppUpdateError = useRecoilCallback<[any], void>(({ set }: CallbackInterface) => (error: any) => {
    set(appUpdateState, (updaterState) => {
      return {
        ...updaterState,
        error: error,
      };
    });
  });

  const setAppUpdateProgress = useRecoilCallback<[number, number], void>(
    ({ set }: CallbackInterface) => (progressPercent: number, downloadSizeInBytes: number) => {
      set(appUpdateState, (updaterState) => {
        return {
          ...updaterState,
          progressPercent,
          downloadSizeInBytes,
        };
      });
    }
  );

  const setMessage = useRecoilCallback<[string], void>(({ set }: CallbackInterface) => (message: string) => {
    set(announcementState, message);
  });

  const onboardingAddCoachMarkRef = useRecoilCallback<[{ [key: string]: any }], void>(
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

  const onboardingSetComplete = useRecoilCallback<[boolean], void>(
    ({ set }: CallbackInterface) => (isComplete: boolean) => {
      set(onboardingState, (onboardingObj) => ({
        ...onboardingObj,
        complete: isComplete,
      }));
      OnboardingState.setComplete(isComplete);
    }
  );

  const setCreationFlowStatus = useRecoilCallback<[CreationFlowStatus], void>(
    ({ set }: CallbackInterface) => (status: CreationFlowStatus) => {
      set(creationFlowStatusState, status);
    }
  );

  const setApplicationLevelError = useRecoilCallback<[StateError], void>(
    ({ set }: CallbackInterface) => (errorObj: StateError) => {
      set(applicationErrorState, errorObj);
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
