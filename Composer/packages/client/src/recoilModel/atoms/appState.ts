// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { atom } from 'recoil';
import { ProjectTemplate, UserSettings } from '@bfc/shared';

import { StorageFolder, StateError, RuntimeTemplate, AppUpdateState } from '../../store/types';

export type BotProject = {
  readonly id: string;
  readonly endpoints: string[];
};

export type CurrentUser = {
  token: string | null;
  email?: string;
  name?: string;
  expiration?: number;
  sessionExpired: boolean;
};

const getFullyQualifiedKey = (value: string) => {
  return `App_${value}_State`;
};

export const botProjects = atom<BotProject[]>({
  key: getFullyQualifiedKey('botProjects'),
  default: [],
});

// TODO: Add type for recent projects
export const recentProjects = atom<any[]>({
  key: getFullyQualifiedKey('recentProjects'),
  default: [],
});

export const templateProjects = atom<ProjectTemplate[]>({
  key: getFullyQualifiedKey('templateProjects'),
  default: [],
});

export const storages = atom<any[]>({
  key: getFullyQualifiedKey('storages'),
  default: [],
});

export const focusedStorageFolder = atom<StorageFolder>({
  key: getFullyQualifiedKey('focusedStorageFolder'),
  default: {} as StorageFolder,
});

export const storageFileLoadingStatus = atom<string>({
  key: getFullyQualifiedKey('storageFileLoadingStatus'),
  default: '',
});

export const applicationError = atom<StateError>({
  key: getFullyQualifiedKey('error'),
  default: {} as StateError,
});

export const currentUser = atom<CurrentUser>({
  key: getFullyQualifiedKey('currentUser'),
  default: {} as CurrentUser,
});

export const visualEditorSelection = atom<string[]>({
  key: getFullyQualifiedKey('visualEditorSelection'),
  default: [],
});

export const onboarding = atom<{
  coachMarkRefs: { [key: string]: any };
  complete: boolean;
}>({
  key: getFullyQualifiedKey('onboarding'),
  default: {
    coachMarkRefs: {},
    complete: false,
  },
});

export const clipboardActions = atom<any[]>({
  key: getFullyQualifiedKey('clipboardActions'),
  default: [],
});

export const runtimeTemplates = atom<RuntimeTemplate[]>({
  key: getFullyQualifiedKey('runtimeTemplates'),
  default: [],
});

export const userSettings = atom<UserSettings>({
  key: getFullyQualifiedKey('userSettings'),
  default: {} as UserSettings,
});

export const announcement = atom<string>({
  key: getFullyQualifiedKey('announcement'),
  default: '',
});

export const appUpdate = atom<AppUpdateState>({
  key: getFullyQualifiedKey('announcement'),
  default: {} as AppUpdateState,
});

export const logEntryList = atom<string[]>({
  key: getFullyQualifiedKey('logEntryList'),
  default: [],
});
