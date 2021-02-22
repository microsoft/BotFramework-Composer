// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { atom, atomFamily } from 'recoil';
import { FormDialogSchemaTemplate, FeatureFlagMap, BotTemplate, UserSettings } from '@bfc/shared';
import { ExtensionMetadata } from '@bfc/extension-client';

import {
  StorageFolder,
  StateError,
  RuntimeTemplate,
  AppUpdateState,
  BoilerplateVersion,
  Notification,
} from '../../recoilModel/types';
import { getUserSettings } from '../utils';
import onboardingStorage from '../../utils/onboardingStorage';
import { CreationFlowStatus, AppUpdaterStatus, CreationFlowType } from '../../constants';
import { TreeLink } from '../../components/ProjectTree/ProjectTree';

export type BotProject = {
  readonly id: string;
  readonly endpoints: string[];
};

export type CurrentUser = {
  token: string | null; // aad token
  email?: string;
  name?: string;
  expiration?: number;
  sessionExpired: boolean;
};

// These values should align with the paths in the app's router
export type PageMode =
  | 'dialogs' // used for the design page
  | 'language-understanding'
  | 'language-generation'
  | 'knowledge-base'
  | 'publish'
  | 'botProjectsSettings'
  | 'forms'
  | 'diagnostics'
  | 'settings'
  | 'projects'
  | 'home'
  | 'botProjectsSettings';

const getFullyQualifiedKey = (value: string) => {
  return `App_${value}_State`;
};

// TODO: Add type for recent projects
export const recentProjectsState = atom<any[]>({
  key: getFullyQualifiedKey('recentProjects'),
  default: [],
});

export const templateProjectsState = atom<BotTemplate[]>({
  key: getFullyQualifiedKey('templateProjects'),
  default: [],
});

export const storagesState = atom<any[]>({
  key: getFullyQualifiedKey('storages'),
  default: [],
});

export const focusedStorageFolderState = atom<StorageFolder>({
  key: getFullyQualifiedKey('focusedStorageFolder'),
  default: {} as StorageFolder,
});

export const storageFileLoadingStatusState = atom<string>({
  key: getFullyQualifiedKey('storageFileLoadingStatus'),
  default: '',
});

export const applicationErrorState = atom<StateError | undefined>({
  key: getFullyQualifiedKey('error'),
  default: {} as StateError,
});

export const currentUserState = atom<CurrentUser>({
  key: getFullyQualifiedKey('currentUser'),
  default: {} as CurrentUser,
});

export const grahpTokenState = atom<CurrentUser>({
  key: getFullyQualifiedKey('grahpToken'),
  default: {} as CurrentUser,
});

export const visualEditorSelectionState = atom<string[]>({
  key: getFullyQualifiedKey('visualEditorSelection'),
  default: [],
});

export const onboardingState = atom<{
  coachMarkRefs: { [key: string]: any };
  complete: boolean;
}>({
  key: getFullyQualifiedKey('onboarding'),
  default: {
    coachMarkRefs: {},
    complete: onboardingStorage.getComplete(),
  },
});

export const clipboardActionsState = atomFamily<any[], string>({
  key: getFullyQualifiedKey('clipboardActions'),
  default: [],
});

export const runtimeTemplatesState = atom<RuntimeTemplate[]>({
  key: getFullyQualifiedKey('runtimeTemplates'),
  default: [],
});

export const userSettingsState = atom<UserSettings>({
  key: getFullyQualifiedKey('userSettings'),
  default: getUserSettings(),
});

export const featureFlagsState = atom<FeatureFlagMap>({
  key: getFullyQualifiedKey('featureFlag'),
  default: {} as FeatureFlagMap,
});

export const announcementState = atom<string>({
  key: getFullyQualifiedKey('announcement'),
  default: '',
});

export const appUpdateState = atom<AppUpdateState>({
  key: getFullyQualifiedKey('appUpdate'),
  default: {
    progressPercent: 0,
    showing: false,
    status: AppUpdaterStatus.IDLE,
  } as AppUpdateState,
});

export const creationFlowStatusState = atom<CreationFlowStatus>({
  key: getFullyQualifiedKey('creationFlowStatus'),
  default: CreationFlowStatus.CLOSE,
});

export const creationFlowTypeState = atom<CreationFlowType>({
  key: getFullyQualifiedKey('creationFlowTpye'),
  default: 'Bot',
});

export const logEntryListState = atom<string[]>({
  key: getFullyQualifiedKey('logEntryList'),
  default: [],
});

export const runtimeSettingsState = atom<{
  path: string;
  startCommand: string;
}>({
  key: getFullyQualifiedKey('runtimeSettings'),
  default: {
    path: '',
    startCommand: '',
  },
});

export const botEndpointsState = atom<Record<string, string>>({
  key: getFullyQualifiedKey('botEndpoints'),
  default: {},
});

export const templateIdState = atom<string>({
  key: getFullyQualifiedKey('templateId'),
  default: 'EmptyBot',
});

export const boilerplateVersionState = atom<BoilerplateVersion>({
  key: getFullyQualifiedKey('boilerplateVersion'),
  default: {
    updateRequired: false,
  },
});

export const notificationIdsState = atom<string[]>({
  key: getFullyQualifiedKey('notificationIds'),
  default: [],
});

export const notificationsState = atomFamily<Notification, string>({
  key: getFullyQualifiedKey('notification'),
  default: (id: string): Notification => {
    return { id, type: 'info', title: '' };
  },
});

export const extensionsState = atom<Omit<ExtensionMetadata, 'path'>[]>({
  key: getFullyQualifiedKey('extensions'),
  default: [],
});

export const botProjectIdsState = atom<string[]>({
  key: getFullyQualifiedKey('botProjectIdsState'),
  default: [],
});

export const currentProjectIdState = atom<string>({
  key: getFullyQualifiedKey('currentProjectId'),
  default: '',
});

export const createQnAOnState = atom<{ projectId: string; dialogId: string }>({
  key: getFullyQualifiedKey('createQnAOn'),
  default: { projectId: '', dialogId: '' },
});

export const botProjectSpaceLoadedState = atom<boolean>({
  key: getFullyQualifiedKey('botProjectSpaceLoadedState'),
  default: false,
});

export const botOpeningState = atom<boolean>({
  key: getFullyQualifiedKey('botOpeningState'),
  default: false,
});

export const botOpeningMessage = atom<string | undefined>({
  key: getFullyQualifiedKey('botOpeningMessage'),
  default: undefined,
});

export const formDialogLibraryTemplatesState = atom<FormDialogSchemaTemplate[]>({
  key: getFullyQualifiedKey('formDialogLibraryTemplates'),
  default: [],
});

export const formDialogGenerationProgressingState = atom({
  key: getFullyQualifiedKey('formDialogGenerationProgressing'),
  default: false,
});

export const formDialogErrorState = atom<
  (Error & { kind: 'templateFetch' | 'generation' | 'deletion'; logs?: string[] }) | undefined
>({
  key: getFullyQualifiedKey('formDialogError'),
  default: undefined,
});

export const pageElementState = atom<{ [page in PageMode]?: { [key: string]: any } }>({
  key: getFullyQualifiedKey('pageElement'),
  default: {
    dialogs: {},
    'language-generation': {},
    'language-understanding': {},
    'knowledge-base': {},
  },
});

export const showCreateDialogModalState = atom<boolean>({
  key: getFullyQualifiedKey('showCreateDialogModal'),
  default: false,
});

export const exportSkillModalInfoState = atom<undefined | string>({
  key: getFullyQualifiedKey('exportSkillModalInfo'),
  default: undefined,
});

export const displaySkillManifestState = atom<undefined | string>({
  key: getFullyQualifiedKey('displaySkillManifest'),
  default: undefined,
});

export const triggerModalInfoState = atom<undefined | { projectId: string; dialogId: string }>({
  key: getFullyQualifiedKey('triggerModalInfo'),
  default: undefined,
});

export const brokenSkillInfoState = atom<undefined | TreeLink>({
  key: getFullyQualifiedKey('brokenSkillInfo'),
  default: undefined,
});

export const brokenSkillRepairCallbackState = atom<undefined | (() => void)>({
  key: getFullyQualifiedKey('brokenSkillRepairCallback'),
  default: undefined,
});

export const dialogModalInfoState = atom<undefined | string>({
  key: getFullyQualifiedKey('dialogModalInfo'),
  default: undefined,
});

export const showAddSkillDialogModalState = atom<boolean>({
  key: getFullyQualifiedKey('showAddSkillDialogModal'),
  default: false,
});

export const debugPanelExpansionState = atom<boolean>({
  key: getFullyQualifiedKey('debugPanelExpansion'),
  default: false,
});

export const debugPanelActiveTabState = atom<string>({
  key: getFullyQualifiedKey('degbugPanelActiveTab'),
  default: '',
});

export const selectedTemplateReadMeState = atom<string>({
  key: getFullyQualifiedKey('selectedTemplateReadMeState'),
  default: '',
});
