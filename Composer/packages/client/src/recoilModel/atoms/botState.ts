// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { atomFamily } from 'recoil';
import {
  DialogInfo,
  DialogSchemaFile,
  Diagnostic,
  LgFile,
  LuFile,
  QnAFile,
  BotSchemas,
  Skill,
  DialogSetting,
  BotProjectSpace,
  BotProjectFile,
} from '@bfc/shared';

import { BotLoadError, DesignPageLocation, QnAAllUpViewStatus } from '../../recoilModel/types';
import FilePersistence from '../persistence/FilePersistence';

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

export const dialogSchemasState = atomFamily<DialogSchemaFile[], string>({
  key: getFullyQualifiedKey('dialogSchema'),
  default: [],
});

export const botDisplayNameState = atomFamily<string, string>({
  key: getFullyQualifiedKey('botDisplayName'),
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

export const showAddSkillDialogModalState = atomFamily<boolean, string>({
  key: getFullyQualifiedKey('showAddSkillDialogModal'),
  default: false,
});

export const settingsState = atomFamily<DialogSetting, string>({
  key: getFullyQualifiedKey('settings'),
  default: { defaultLanguage: 'en-us', languages: ['en-us'], luis: {}, qna: {} } as DialogSetting,
});

export const publishVersionsState = atomFamily<any, string>({
  key: getFullyQualifiedKey('publishVersions'),
  default: {},
});

export const publishStatusState = atomFamily<any, string>({
  key: getFullyQualifiedKey('publishStatus'),
  default: 'inactive',
});

export const lastPublishChangeState = atomFamily<any, string>({
  key: getFullyQualifiedKey('lastPublishChange'),
  default: null,
});

export const publishTypesState = atomFamily<PublishType[], string>({
  key: getFullyQualifiedKey('publishTypes'),
  default: [],
});

export const publishHistoryState = atomFamily<any, string>({
  key: getFullyQualifiedKey('publishHistory'),
  default: {},
});

export const onCreateDialogCompleteState = atomFamily<any, string>({
  key: getFullyQualifiedKey('onCreateDialogComplete'),
  default: {
    func: undefined,
  },
});

export const focusPathState = atomFamily<string, string>({
  key: getFullyQualifiedKey('focusPath'),
  default: '',
});

export const onAddSkillDialogCompleteState = atomFamily<any, string>({
  key: getFullyQualifiedKey('onAddSkillDialogComplete'),
  default: { func: undefined },
});

export const displaySkillManifestState = atomFamily<any, string>({
  key: getFullyQualifiedKey('displaySkillManifest'),
  default: undefined,
});

export const showAddLanguageModalState = atomFamily<boolean, string>({
  key: getFullyQualifiedKey('showAddLanguageModal'),
  default: false,
});

export const showDelLanguageModalState = atomFamily<boolean, string>({
  key: getFullyQualifiedKey('showDelLanguageModal'),
  default: false,
});

export const onAddLanguageDialogCompleteState = atomFamily<any, string>({
  key: getFullyQualifiedKey('onAddLanguageDialogComplete'),
  default: { func: undefined },
});

export const onDelLanguageDialogCompleteState = atomFamily<any, string>({
  key: getFullyQualifiedKey('onDelLanguageDialogComplete'),
  default: { func: undefined },
});

export const projectMetaDataState = atomFamily<{ isRootBot: boolean; isRemote: boolean }, string>({
  key: getFullyQualifiedKey('projectsMetaDataState'),
  default: () => {
    return {
      isRootBot: false,
      isRemote: false,
    };
  },
});

export const designPageLocationState = atomFamily<DesignPageLocation, string>({
  key: getFullyQualifiedKey('designPageLocation'),
  default: {
    dialogId: '',
    focused: '',
    selected: '',
  },
});

export const qnaAllUpViewStatusState = atomFamily<any, string>({
  key: getFullyQualifiedKey('qnaAllUpViewStatusState'),
  default: QnAAllUpViewStatus.Success,
});

export const isEjectRuntimeExistState = atomFamily<boolean, string>({
  key: getFullyQualifiedKey('isEjectRuntimeExist'),
  default: false,
});

export const qnaFilesState = atomFamily<QnAFile[], string>({
  key: getFullyQualifiedKey('qnaFiles'),
  default: [],
});

export const filePersistenceState = atomFamily<FilePersistence, string>({
  key: getFullyQualifiedKey('filePersistence'),
  default: {} as FilePersistence,
  dangerouslyAllowMutability: true,
});

export const botProjectFileState = atomFamily<BotProjectFile, string>({
  key: getFullyQualifiedKey('botProjectFile'),
  default: {
    content: {} as BotProjectSpace,
    id: '',
    lastModified: '',
  },
});

export const botErrorState = atomFamily<any, string>({
  key: getFullyQualifiedKey('botError'),
  default: undefined,
});

// Object key to identify the skill in BotProject file and settings.skill
export const botNameIdentifierState = atomFamily<string, string>({
  key: getFullyQualifiedKey('botNameIdentifier'),
  default: '',
});
