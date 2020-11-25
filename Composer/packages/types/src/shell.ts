// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-explicit-any */

import { AxiosInstance } from 'axios';

import type {
  DialogInfo,
  LuFile,
  LgFile,
  QnAFile,
  LuIntentSection,
  LgTemplate,
  DialogSchemaFile,
  LuProviderType,
} from './indexers';
import type { ILUFeaturesConfig, SkillSetting, UserSettings, DialogSetting } from './settings';
import type { JSONSchema7 } from './schema';
import { MicrosoftIDialog } from './sdk';
import { FeatureFlagKey } from './featureFlags';

/** Recursively marks all properties as optional. */
type AllPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[] ? AllPartial<U>[] : T[P] extends object ? AllPartial<T[P]> : T[P];
};

export type HttpClient = AxiosInstance;

export type ZoomInfo = {
  rateList: number[];
  maxRate: number;
  minRate: number;
  currentRate: number;
};

export type EditorSchema = {
  content?: {
    fieldTemplateOverrides: any;
    SDKOverrides?: any;
  };
};

type UISchema = {
  [key: string]: {
    form?: any;
    flow?: any;
    menu?: any;
  };
};

export type BotSchemas = {
  default?: JSONSchema7;
  sdk?: any;
  ui?: { content: UISchema };
  uiOverrides?: { content: UISchema };
  diagnostics?: any[];
};

export type ApplicationContextApi = {
  navigateTo: (to: string, opts?: { state?: any; replace?: boolean }) => void;
  updateUserSettings: (settings: AllPartial<UserSettings>) => void;
  announce: (message: string) => void;
  addCoachMarkRef: (ref: { [key: string]: any }) => void;
  isFeatureEnabled: (featureFlagKey: FeatureFlagKey) => boolean;
  setApplicationLevelError: (err: any) => void;
  confirm: (title: string, subTitle: string, settings?: any) => Promise<boolean>;
};

export type ApplicationContext = {
  locale: string;
  hosted: boolean;
  userSettings: UserSettings;
  flowZoomRate: ZoomInfo;

  httpClient: HttpClient;
};

export type LuContextApi = {
  getLuIntent: (id: string, intentName: string) => LuIntentSection | undefined;
  getLuIntents: (id: string) => LuIntentSection[];
  addLuIntent: (id: string, intentName: string, intent: LuIntentSection) => Promise<LuFile[] | undefined>;
  updateLuFile: (id: string, content: string) => Promise<void>;
  updateLuIntent: (id: string, intentName: string, intent: LuIntentSection) => Promise<LuFile[] | undefined>;
  debouncedUpdateLuIntent: (id: string, intentName: string, intent: LuIntentSection) => Promise<LuFile[] | undefined>;
  renameLuIntent: (id: string, intentName: string, newIntentName: string) => Promise<LuFile[] | undefined>;
  removeLuIntent: (id: string, intentName: string) => Promise<LuFile[] | undefined>;
};

export type LgContextApi = {
  getLgTemplates: (id: string) => LgTemplate[];
  copyLgTemplate: (id: string, fromTemplateName: string, toTemplateName?: string) => Promise<LgFile[] | undefined>;
  addLgTemplate: (id: string, templateName: string, templateStr: string) => Promise<LgFile[] | undefined>;
  updateLgFile: (id: string, content: string) => Promise<void>;
  updateLgTemplate: (id: string, templateName: string, templateStr: string) => Promise<LgFile[] | undefined>;
  debouncedUpdateLgTemplate: (id: string, templateName: string, templateStr: string) => Promise<LgFile[] | undefined>;
  removeLgTemplate: (id: string, templateName: string) => Promise<LgFile[] | undefined>;
  removeLgTemplates: (id: string, templateNames: string[]) => Promise<LgFile[] | undefined>;
};

export type ProjectContextApi = {
  getDialog: (dialogId: string) => any;
  saveDialog: (dialogId: string, newDialogData: any) => any;
  reloadProject: () => void;
  navTo: (path: string) => void;

  updateQnaContent: (id: string, content: string) => void;
  updateRegExIntent: (id: string, intentName: string, pattern: string) => void;
  renameRegExIntent: (id: string, intentName: string, newIntentName: string) => void;
  updateIntentTrigger: (id: string, intentName: string, newIntentName: string) => void;
  createDialog: (actions: any) => Promise<string | null>;
  commitChanges: () => void;
  addSkillDialog: () => Promise<{ manifestUrl: string; name: string } | null>;
  displayManifestModal: (manifestId: string) => void;
  updateDialogSchema: (_: DialogSchemaFile) => Promise<void>;
  createTrigger: (id: string, formData, autoSelected?: boolean) => void;
  createQnATrigger: (id: string) => void;
  updateSkillSetting: (skillId: string, skillsData: SkillSetting) => Promise<void>;
  updateFlowZoomRate: (currentRate: number) => void;
  updateRecognizer: (projectId: string, dialogId: string, kind: LuProviderType) => void;
};

export type ProjectContext = {
  botName: string;
  projectId: string;
  dialogs: DialogInfo[];
  dialogSchemas: DialogSchemaFile[];
  lgFiles: LgFile[];
  luFiles: LuFile[];
  luFeatures: ILUFeaturesConfig;
  qnaFiles: QnAFile[];
  skills: any[];
  skillsSettings: Record<string, SkillSetting>;
  schemas: BotSchemas;
  settings: DialogSetting;
};

export type ActionContextApi = {
  constructAction: (dialogId: string, action: MicrosoftIDialog) => Promise<MicrosoftIDialog>;
  constructActions: (dialogId: string, actions: MicrosoftIDialog[]) => Promise<MicrosoftIDialog[]>;
  copyAction: (dialogId: string, action: MicrosoftIDialog) => Promise<MicrosoftIDialog>;
  copyActions: (dialogId: string, actions: MicrosoftIDialog[]) => Promise<MicrosoftIDialog[]>;
  deleteAction: (dialogId: string, action: MicrosoftIDialog) => Promise<void>;
  deleteActions: (dialogId: string, actions: MicrosoftIDialog[]) => Promise<void>;
  actionsContainLuIntent: (action: MicrosoftIDialog[]) => boolean;
};

export type DialogEditingContextApi = {
  saveData: <T = any>(newData: T, updatePath?: string, callback?: () => void | Promise<void>) => Promise<void>;
  onFocusSteps: (stepIds: string[], focusedTab?: string) => Promise<void>;
  onFocusEvent: (eventId: string) => Promise<void>;
  onSelect: (ids: string[]) => void;
  onCopy: (clipboardActions: any[]) => void;
  undo: () => void;
  redo: () => void;
};

export type DialogEditingContext = {
  currentDialog: DialogInfo;
  designerId: string;
  dialogId: string;
  clipboardActions: any[];
  focusedEvent: string;
  focusedActions: string[];
  focusedSteps: string[];
  focusedTab?: string;
  focusPath: string;
};

export type ShellData = ApplicationContext & ProjectContext & DialogEditingContext;

export type ShellApi = ApplicationContextApi &
  ProjectContextApi &
  DialogEditingContextApi &
  LgContextApi &
  LuContextApi &
  ActionContextApi;

export type Shell = {
  api: ShellApi;
  data: ShellData;
};
