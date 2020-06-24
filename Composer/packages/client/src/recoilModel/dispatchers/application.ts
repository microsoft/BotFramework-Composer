/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface, useRecoilCallback } from 'recoil';
import debounce from 'lodash/debounce';
import merge from 'lodash/merge';
import { UserSettings } from '@bfc/shared';

import {
  appUpdateState,
  announcementState,
  userSettingsState,
  onboardingState,
  currentUserState,
  CurrentUser,
  creationFlowStatusState,
} from '../atoms/appState';
import { AppUpdaterStatus, CreationFlowStatus } from '../../constants';
import { isElectron } from '../../utils/electronUtil';
import storage from '../../utils/storage';

export const applicationDispatcher = () => {
  const setAppUpdateStatus = useRecoilCallback<[AppUpdaterStatus, string], Promise<void>>(
    ({ set, snapshot: { getPromise } }: CallbackInterface) => async (status: AppUpdaterStatus, version: string) => {
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

  const setUserSettings = useRecoilCallback<[Partial<UserSettings>], void>(
    ({ set }: CallbackInterface) => (settings: Partial<UserSettings>) => {
      set(userSettingsState, (currentSettings) => {
        const newSettings = merge(currentSettings, settings);
        if (isElectron()) {
          // push updated settings to electron main process
          window.ipcRenderer.send('update-user-settings', newSettings);
        }
        storage.set('userSettings', newSettings);
        return newSettings;
      });
    }
  );

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
        isComplete,
      }));
    }
  );

  const setUserToken = useRecoilCallback<[Partial<CurrentUser>], void>(({ set }: CallbackInterface) => (user = {}) => {
    set(currentUserState, () => ({
      ...user,
      token: user.token || null,
      sessionExpired: false,
    }));
  });

  const setUserSessionExpired = useRecoilCallback<[{ expired: boolean }], void>(
    ({ set }: CallbackInterface) => ({ expired }) => {
      set(currentUserState, (currentUser: CurrentUser) => ({
        ...currentUser,
        sessionExpired: !!expired,
      }));
    }
  );

  const setCreationFlowStatus = useRecoilCallback<[CreationFlowStatus], void>(
    ({ set }: CallbackInterface) => (status: CreationFlowStatus) => {
      set(creationFlowStatusState, status);
    }
  );

  return {
    setAppUpdateStatus,
    setAppUpdateShowing,
    setAppUpdateError,
    setAppUpdateProgress,
    setMessage: debounce(setMessage, 500),
    setUserSettings,
    onboardingSetComplete,
    onboardingAddCoachMarkRef,
    setUserToken,
    setUserSessionExpired,
    setCreationFlowStatus,
  };
};
