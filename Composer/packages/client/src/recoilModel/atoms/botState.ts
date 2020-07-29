// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DialogInfo, Diagnostic, LgFile, LuFile, BotSchemas, Skill, DialogSetting } from '@bfc/shared';
import { atom, atomFamily } from 'recoil';

import { BotLoadError, DesignPageLocation } from '../../recoilModel/types';

import { PublishType, BreadcrumbItem } from './../../recoilModel/types';
import { BotStatus } from './../../constants';

const getFullyQualifiedKey = (value: string) => {
  return `Bot_${value}_State`;
};

export const dialogsState = atomFamily<DialogInfo[], string>({
  key: getFullyQualifiedKey('dialogs'),
  default: (id) => {
    return [];
  },
});

export const schemasState = atomFamily<BotSchemas, string>({
  key: getFullyQualifiedKey('schemas'),
  default: (id) => {
    return {};
  },
});

export const currentProjectIdState = atom<string>({
  key: getFullyQualifiedKey('currentProjectId'),
  default: '',
});

export const botProjectsState = atom<string[]>({
  key: getFullyQualifiedKey('botProjects'),
  default: [],
});

export const botNameState = atomFamily<string, string>({
  key: getFullyQualifiedKey('botName'),
  default: (id) => {
    return '';
  },
});

export const locationState = atomFamily<string, string>({
  key: getFullyQualifiedKey('location'),
  default: (id) => {
    return '';
  },
});

export const botEnvironmentState = atomFamily<string, string>({
  key: getFullyQualifiedKey('botEnvironment'),
  default: (id) => {
    return 'production';
  },
});

// current bot authoring language
export const localeState = atomFamily<string, string>({
  key: getFullyQualifiedKey('locale'),
  default: (id) => {
    return 'en-us';
  },
});

export const botStatusState = atomFamily<BotStatus, string>({
  key: getFullyQualifiedKey('botStatus'),
  default: (id) => {
    return BotStatus.unConnected;
  },
});

export const botDiagnosticsState = atomFamily<Diagnostic[], string>({
  key: getFullyQualifiedKey('botDiagnostics'),
  default: (id) => {
    return [];
  },
});

export const botLoadErrorState = atomFamily<BotLoadError, string>({
  key: getFullyQualifiedKey('botLoadErrorMsg'),
  default: (id) => {
    return { title: '', message: '' };
  },
});

export const lgFilesState = atomFamily<LgFile[], string>({
  key: getFullyQualifiedKey('lgFiles'),
  default: (id) => {
    return [];
  },
});

export const luFilesState = atomFamily<LuFile[], string>({
  key: getFullyQualifiedKey('luFiles'),
  default: (id) => {
    return [];
  },
});

export const skillsState = atomFamily<Skill[], string>({
  key: getFullyQualifiedKey('skills'),
  default: (id) => {
    return [];
  },
});

export const actionsSeedState = atomFamily<any, string>({
  key: getFullyQualifiedKey('actionsSeed'),
  default: (id) => {
    return [];
  },
});

export const skillManifestsState = atomFamily<any, string>({
  key: getFullyQualifiedKey('skillManifests'),
  default: (id) => {
    return [];
  },
});

export const designPageLocationState = atomFamily<DesignPageLocation, string>({
  key: getFullyQualifiedKey('designPageLocation'),
  default: (id) => {
    return {
      projectId: '',
      dialogId: '',
      focused: '',
      selected: '',
    };
  },
});

export const breadcrumbState = atomFamily<BreadcrumbItem[], string>({
  key: getFullyQualifiedKey('breadcrumb'),
  default: (id) => {
    return [];
  },
});

export const showCreateDialogModalState = atomFamily<boolean, string>({
  key: getFullyQualifiedKey('showCreateDialogModal'),
  default: (id) => {
    return false;
  },
});

export const showAddSkillDialogModalState = atom<boolean>({
  key: getFullyQualifiedKey('showAddSkillDialogModal'),
  default: false,
});

export const settingsState = atom<DialogSetting>({
  key: getFullyQualifiedKey('settings'),
  default: { defaultLanguage: 'en-us', languages: ['en-us'], luis: {} } as DialogSetting,
});

export const publishVersionsState = atom<any>({
  key: getFullyQualifiedKey('publishVersions'),
  default: {},
});

export const publishStatusState = atom<any>({
  key: getFullyQualifiedKey('publishStatus'),
  default: 'inactive',
});

export const lastPublishChangeState = atom<any>({
  key: getFullyQualifiedKey('lastPublishChange'),
  default: null,
});

export const publishTypesState = atom<PublishType[]>({
  key: getFullyQualifiedKey('publishTypes'),
  default: [],
});

export const botOpeningState = atom<boolean>({
  key: getFullyQualifiedKey('botOpening'),
  default: false,
});

export const publishHistoryState = atom<any>({
  key: getFullyQualifiedKey('publishHistory'),
  default: {},
});

export const onCreateDialogCompleteState = atom<any>({
  key: getFullyQualifiedKey('onCreateDialogComplete'),
  default: {
    func: undefined,
  },
});

export const focusPathState = atom<string>({
  key: getFullyQualifiedKey('focusPath'),
  default: '',
});

export const onAddSkillDialogCompleteState = atom<any>({
  key: getFullyQualifiedKey('onAddSkillDialogComplete'),
  default: { func: undefined },
});

export const displaySkillManifestState = atom<any>({
  key: getFullyQualifiedKey('displaySkillManifest'),
  default: undefined,
});

export const showAddLanguageModalState = atom<boolean>({
  key: getFullyQualifiedKey('showAddLanguageModal'),
  default: false,
});

export const showDelLanguageModalState = atom<boolean>({
  key: getFullyQualifiedKey('showDelLanguageModal'),
  default: false,
});

export const onAddLanguageDialogCompleteState = atom<any>({
  key: getFullyQualifiedKey('onAddLanguageDialogComplete'),
  default: { func: undefined },
});

export const onDelLanguageDialogCompleteState = atom<any>({
  key: getFullyQualifiedKey('onDelLanguageDialogComplete'),
  default: { func: undefined },
});
