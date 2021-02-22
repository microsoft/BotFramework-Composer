// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  BotProjectFile,
  BotProjectSpace,
  BotSchemas,
  CrosstrainConfig,
  Diagnostic,
  DialogInfo,
  DialogSchemaFile,
  DialogSetting,
  FormDialogSchema,
  JsonSchemaFile,
  LgFile,
  LuFile,
  QnAFile,
  SkillManifestFile,
  RecognizerFile,
} from '@bfc/shared';
import { DirectLineLog } from '@botframework-composer/types/src';
import { atomFamily } from 'recoil';

import { BotRuntimeError, DesignPageLocation } from '../../recoilModel/types';
import FilePersistence from '../persistence/FilePersistence';

import { BotStatus } from './../../constants';
import { PublishType } from './../../recoilModel/types';

const getFullyQualifiedKey = (value: string) => {
  return `Bot_${value}_State`;
};

const emptyDialog: DialogInfo = {
  content: { $kind: '' },
  diagnostics: [],
  displayName: '',
  id: '',
  isRoot: false,
  lgFile: '',
  lgTemplates: [],
  luFile: '',
  qnaFile: '',
  referredLuIntents: [],
  referredDialogs: [],
  triggers: [],
  intentTriggers: [],
  skills: [],
  isFormDialog: false,
};

const emptyLg: LgFile = {
  id: '',
  content: '',
  diagnostics: [],
  templates: [],
  allTemplates: [],
  imports: [],
};

type LgStateParams = { projectId: string; lgFileId: string };

export const lgFileState = atomFamily<LgFile, LgStateParams>({
  key: getFullyQualifiedKey('lg'),
  default: () => {
    return emptyLg;
  },
});

export const lgFileIdsState = atomFamily<string[], string>({
  key: getFullyQualifiedKey('lgFileIds'),
  default: () => {
    return [];
  },
});

type dialogStateParams = { projectId: string; dialogId: string };
export const dialogState = atomFamily<DialogInfo, dialogStateParams>({
  key: getFullyQualifiedKey('dialog'),
  default: () => {
    return emptyDialog;
  },
});

export const dialogIdsState = atomFamily<string[], string>({
  key: getFullyQualifiedKey('dialogIds'),
  default: () => {
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
    return BotStatus.inactive;
  },
});

export const botDiagnosticsState = atomFamily<Diagnostic[], string>({
  key: getFullyQualifiedKey('botDiagnostics'),
  default: (id) => {
    return [];
  },
});

export const botRuntimeErrorState = atomFamily<BotRuntimeError, string>({
  key: getFullyQualifiedKey('botLoadErrorMsg'),
  default: (id) => {
    return { title: '', message: '' };
  },
});

export const luFilesState = atomFamily<LuFile[], string>({
  key: getFullyQualifiedKey('luFiles'),
  default: (id) => {
    return [];
  },
});

export const recognizerIdsState = atomFamily<string[], string>({
  key: getFullyQualifiedKey('recognizerIds'),
  default: (id) => {
    return [];
  },
});

export const recognizerState = atomFamily<RecognizerFile, { projectId: string; id: string }>({
  key: getFullyQualifiedKey('recognizer'),
  default: () => {
    return {} as RecognizerFile;
  },
});

export const crossTrainConfigState = atomFamily<CrosstrainConfig, string>({
  key: getFullyQualifiedKey('crossTrainConfig'),
  default: () => {
    return {};
  },
});

export const actionsSeedState = atomFamily<any, string>({
  key: getFullyQualifiedKey('actionsSeed'),
  default: (id) => {
    return [];
  },
});

export const skillManifestsState = atomFamily<SkillManifestFile[], string>({
  key: getFullyQualifiedKey('skillManifests'),
  default: (id) => {
    return [];
  },
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

export const provisionStatusState = atomFamily<any, string>({
  key: getFullyQualifiedKey('provisionStatus'),
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

export const showCreateQnAFromUrlDialogState = atomFamily<boolean, string>({
  key: getFullyQualifiedKey('showCreateQnAFromUrlDialog'),
  default: false,
});

export const showCreateQnAFromScratchDialogState = atomFamily<boolean, string>({
  key: getFullyQualifiedKey('showCreateQnAFromScratchDialog'),
  default: false,
});
export const onCreateQnAFromUrlDialogCompleteState = atomFamily<{ func: undefined | (() => void) }, string>({
  key: getFullyQualifiedKey('onCreateQnAFromUrlDialogCompleteState'),
  default: { func: undefined },
});
export const onCreateQnAFromScratchDialogCompleteState = atomFamily<{ func: undefined | (() => void) }, string>({
  key: getFullyQualifiedKey('onCreateQnAFromScratchDialogCompleteState'),
  default: { func: undefined },
});

export const isEjectRuntimeExistState = atomFamily<boolean, string>({
  key: getFullyQualifiedKey('isEjectRuntimeExist'),
  default: false,
});

export const qnaFilesState = atomFamily<QnAFile[], string>({
  key: getFullyQualifiedKey('qnaFiles'),
  default: [],
});

export const jsonSchemaFilesState = atomFamily<JsonSchemaFile[], string>({
  key: getFullyQualifiedKey('jsonSchemaFiles'),
  default: [],
});

export const filePersistenceState = atomFamily<FilePersistence, string>({
  key: getFullyQualifiedKey('filePersistence'),
  default: {} as FilePersistence,
  dangerouslyAllowMutability: true,
});

export const formDialogSchemaIdsState = atomFamily<string[], string>({
  key: getFullyQualifiedKey('formDialogSchemaIds'),
  default: [],
});

export const formDialogSchemaState = atomFamily<FormDialogSchema, { projectId: string; schemaId: string }>({
  key: getFullyQualifiedKey('formDialogSchema'),
  default: {
    id: '',
    content: '',
  } as FormDialogSchema,
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

// TODO: Currently always setting to 0 as we dont support more than 1 manifest. This index would need to change based on the default manifest chosen in the future.
export const currentSkillManifestIndexState = atomFamily<number, string>({
  key: getFullyQualifiedKey('currentSkillManifestIndex'),
  default: 0,
});

export const canUndoState = atomFamily<boolean, string>({
  key: getFullyQualifiedKey('canUndoState'),
  default: false,
});

export const canRedoState = atomFamily<boolean, string>({
  key: getFullyQualifiedKey('canRedoState'),
  default: false,
});

export const webChatLogsState = atomFamily<DirectLineLog[], string>({
  key: getFullyQualifiedKey('webChatLogs'),
  default: [],
});
