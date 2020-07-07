// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { atom } from 'recoil';
import { DialogInfo, Diagnostic, LgFile, LuFile, BotSchemas, Skill } from '@bfc/shared';

import { BotLoadError, DesignPageLocation, PublishTarget } from '../../recoilModel/types';

import { PublishType, DialogSetting, BreadcrumbItem } from './../../recoilModel/types';
import { BotStatus } from './../../constants';

export const dialogsState = atom<DialogInfo[]>({
  key: 'dialogs',
  default: [],
});

export const projectIdState = atom<string>({
  key: 'projectId',
  default: '',
});

export const botNameState = atom<string>({
  key: 'botName',
  default: '',
});

export const locationState = atom<string>({
  key: 'location',
  default: '',
});

export const botEnvironmentState = atom<string>({
  key: 'botEnvironment',
  default: 'production',
});

export const localeState = atom<string>({
  key: 'locale',
  default: 'en-us',
});

export const BotDiagnosticsState = atom<Diagnostic[]>({
  key: 'botDiagnostics',
  default: [],
});

export const botStatusState = atom<BotStatus>({
  key: 'botStatus',
  default: BotStatus.unConnected,
});

export const botLoadErrorState = atom<BotLoadError>({
  key: 'botLoadErrorMsg',
  default: { title: '', message: '' },
});

export const lgFilesState = atom<LgFile[]>({
  key: 'lgFiles',
  default: [],
});

export const luFilesState = atom<LuFile[]>({
  key: 'luFiles',
  default: [],
});

export const schemasState = atom<BotSchemas>({
  key: 'schemas',
  default: {},
});

export const skillsState = atom<Skill[]>({
  key: 'skills',
  default: [],
});

export const actionsSeedState = atom<any>({
  key: 'actionsSeed',
  default: [],
});

export const skillManifestsState = atom<any[]>({
  key: 'skillManifests',
  default: [],
});

export const designPageLocationState = atom<DesignPageLocation>({
  key: 'designPageLocation',
  default: {
    projectId: '',
    dialogId: '',
    focused: '',
    selected: '',
  },
});

export const breadcrumbState = atom<BreadcrumbItem[]>({
  key: 'breadcrumb',
  default: [],
});

export const showCreateDialogModalState = atom<boolean>({
  key: 'showCreateDialogModal',
  default: false,
});

export const showAddSkillDialogModalState = atom<boolean>({
  key: 'showAddSkillDialogModal',
  default: false,
});

export const settingsState = atom<DialogSetting>({
  key: 'settings',
  default: {} as DialogSetting,
});

export const publishVersionsState = atom<any>({
  key: 'publishVersions',
  default: {},
});

export const publishStatusState = atom<any>({
  key: 'publishStatus',
  default: 'inactive',
});

export const lastPublishChangeState = atom<any>({
  key: 'lastPublishChange',
  default: null,
});

export const publishTypesState = atom<PublishType[]>({
  key: 'publishTypes',
  default: [],
});

export const botOpeningState = atom<boolean>({
  key: 'botOpening',
  default: false,
});

export const publishHistoryState = atom<any>({
  key: 'publishHistory',
  default: {},
});

export const onCreateDialogCompleteState = atom<any>({
  key: 'onCreateDialogComplete',
  default: undefined,
});

export const focusPathState = atom<string>({
  key: 'focusPath',
  default: '',
});

export const onAddSkillDialogCompleteState = atom<any>({
  key: 'onAddSkillDialogComplete',
  default: undefined,
});

export const displaySkillManifestState = atom<any>({
  key: 'displaySkillManifest',
  default: undefined,
});
