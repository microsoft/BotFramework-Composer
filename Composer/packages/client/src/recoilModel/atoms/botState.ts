// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { atom } from 'recoil';
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
} from '@bfc/shared';

import { BotLoadError, DesignPageLocation, QnAAllUpViewStatus } from '../../recoilModel/types';

import { PublishType, BreadcrumbItem } from './../../recoilModel/types';
import { BotStatus } from './../../constants';
const getFullyQualifiedKey = (value: string) => {
  return `Bot_${value}_State`;
};

export const dialogsState = atom<DialogInfo[]>({
  key: getFullyQualifiedKey('dialogs'),
  default: [],
});

export const dialogSchemasState = atom<DialogSchemaFile[]>({
  key: getFullyQualifiedKey('dialogSchema'),
  default: [],
});

export const projectIdState = atom<string>({
  key: getFullyQualifiedKey('projectId'),
  default: '',
});

export const botNameState = atom<string>({
  key: getFullyQualifiedKey('botName'),
  default: '',
});

export const locationState = atom<string>({
  key: getFullyQualifiedKey('location'),
  default: '',
});

export const botEnvironmentState = atom<string>({
  key: getFullyQualifiedKey('botEnvironment'),
  default: 'production',
});

// current bot authoring language
export const localeState = atom<string>({
  key: getFullyQualifiedKey('locale'),
  default: 'en-us',
});

export const BotDiagnosticsState = atom<Diagnostic[]>({
  key: getFullyQualifiedKey('botDiagnostics'),
  default: [],
});

export const botStatusState = atom<BotStatus>({
  key: getFullyQualifiedKey('botStatus'),
  default: BotStatus.unConnected,
});

export const botLoadErrorState = atom<BotLoadError>({
  key: getFullyQualifiedKey('botLoadErrorMsg'),
  default: { title: '', message: '' },
});

export const lgFilesState = atom<LgFile[]>({
  key: getFullyQualifiedKey('lgFiles'),
  default: [],
});

export const luFilesState = atom<LuFile[]>({
  key: getFullyQualifiedKey('luFiles'),
  default: [],
});

export const qnaFilesState = atom<QnAFile[]>({
  key: getFullyQualifiedKey('qnaFiles'),
  default: [],
});

export const schemasState = atom<BotSchemas>({
  key: getFullyQualifiedKey('schemas'),
  default: {},
});

export const skillsState = atom<Skill[]>({
  key: getFullyQualifiedKey('skills'),
  default: [],
});

export const actionsSeedState = atom<any>({
  key: getFullyQualifiedKey('actionsSeed'),
  default: [],
});

export const skillManifestsState = atom<any[]>({
  key: getFullyQualifiedKey('skillManifests'),
  default: [],
});

export const designPageLocationState = atom<DesignPageLocation>({
  key: getFullyQualifiedKey('designPageLocation'),
  default: {
    projectId: '',
    dialogId: '',
    focused: '',
    selected: '',
  },
});

export const breadcrumbState = atom<BreadcrumbItem[]>({
  key: getFullyQualifiedKey('breadcrumb'),
  default: [],
});

export const showCreateDialogModalState = atom<boolean>({
  key: getFullyQualifiedKey('showCreateDialogModal'),
  default: false,
});

export const showAddSkillDialogModalState = atom<boolean>({
  key: getFullyQualifiedKey('showAddSkillDialogModal'),
  default: false,
});

export const settingsState = atom<DialogSetting>({
  key: getFullyQualifiedKey('settings'),
  default: { defaultLanguage: 'en-us', languages: ['en-us'], luis: {}, qna: {} } as DialogSetting,
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

export const qnaAllUpViewStatusState = atom<any>({
  key: getFullyQualifiedKey('qnaAllUpViewStatusState'),
  default: QnAAllUpViewStatus.Success,
});

export const isEjectRuntimeExistState = atom<boolean>({
  key: getFullyQualifiedKey('isEjectRuntimeExist'),
  default: false,
});
