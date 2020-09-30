// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-explicit-any */

import { DialogInfo, LuFile, LgFile, QnAFile, LuIntentSection, LgTemplate, DialogSchemaFile } from './indexers';
import { ILUFeaturesConfig, SkillSetting, UserSettings } from './settings';
import { OBISchema } from './schema';

/** Recursively marks all properties as optional. */
type AllPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[] ? AllPartial<U>[] : T[P] extends object ? AllPartial<T[P]> : T[P];
};

export interface EditorSchema {
  content?: {
    fieldTemplateOverrides: any;
    SDKOverrides?: any;
  };
}

type UISchema = {
  [key: string]: {
    form?: any;
    flow?: any;
    menu?: any;
  };
};
export interface BotSchemas {
  default?: OBISchema;
  sdk?: any;
  ui?: { content: UISchema };
  uiOverrides?: { content: UISchema };
  diagnostics?: any[];
}

export interface ShellData {
  locale: string;
  botName: string;
  currentDialog: DialogInfo;
  projectId: string;
  data: {
    $kind: string;
    [key: string]: any;
  };
  designerId: string;
  dialogId: string;
  dialogs: DialogInfo[];
  dialogSchemas: DialogSchemaFile[];
  focusedEvent: string;
  focusedActions: string[];
  focusedSteps: string[];
  focusedTab?: string;
  focusPath: string;
  clipboardActions: any[];
  hosted: boolean;
  lgFiles: LgFile[];
  luFiles: LuFile[];
  luFeatures: ILUFeaturesConfig;
  qnaFiles: QnAFile[];
  userSettings: UserSettings;
  skills: any[];
  skillsSettings: Record<string, SkillSetting>;
  // TODO: remove
  schemas: BotSchemas;
}

export interface ShellApi {
  getDialog: (dialogId: string) => any;
  saveDialog: (dialogId: string, newDialogData: any) => any;
  saveData: <T = any>(newData: T, updatePath?: string) => void;
  navTo: (path: string, rest?: any) => void;
  onFocusSteps: (stepIds: string[], focusedTab?: string) => void;
  onFocusEvent: (eventId: string) => void;
  onSelect: (ids: string[]) => void;
  getLgTemplates: (id: string) => LgTemplate[];
  copyLgTemplate: (id: string, fromTemplateName: string, toTemplateName?: string) => Promise<LgFile[] | undefined>;
  addLgTemplate: (id: string, templateName: string, templateStr: string) => Promise<LgFile[] | undefined>;
  updateLgTemplate: (id: string, templateName: string, templateStr: string) => Promise<LgFile[] | undefined>;
  deboucedUpdateLgTemplate: (id: string, templateName: string, templateStr: string) => Promise<LgFile[] | undefined>;
  removeLgTemplate: (id: string, templateName: string) => Promise<LgFile[] | undefined>;
  removeLgTemplates: (id: string, templateNames: string[]) => Promise<LgFile[] | undefined>;
  getLuIntent: (id: string, intentName: string) => LuIntentSection | undefined;
  getLuIntents: (id: string) => LuIntentSection[];
  addLuIntent: (id: string, intentName: string, intent: LuIntentSection) => Promise<LuFile[] | undefined>;
  updateLuIntent: (id: string, intentName: string, intent: LuIntentSection) => Promise<LuFile[] | undefined>;
  deboucedUpdateLuIntent: (id: string, intentName: string, intent: LuIntentSection) => Promise<LuFile[] | undefined>;
  renameLuIntent: (id: string, intentName: string, newIntentName: string) => Promise<LuFile[] | undefined>;
  removeLuIntent: (id: string, intentName: string) => void;
  updateQnaContent: (id: string, content: string) => void;
  updateRegExIntent: (id: string, intentName: string, pattern: string) => void;
  renameRegExIntent: (id: string, intentName: string, newIntentName: string) => void;
  updateIntentTrigger: (id: string, intentName: string, newIntentName: string) => void;
  createDialog: (actions: any) => Promise<string | null>;
  addCoachMarkRef: (ref: { [key: string]: any }) => void;
  onCopy: (clipboardActions: any[]) => void;
  undo: () => void;
  redo: () => void;
  commitChanges: () => void;
  updateUserSettings: (settings: AllPartial<UserSettings>) => void;
  addSkillDialog: () => Promise<{ manifestUrl: string; name: string } | null>;
  announce: (message: string) => void;
  displayManifestModal: (manifestId: string) => void;
  updateDialogSchema: (_: DialogSchemaFile) => Promise<void>;
  createTrigger: (id: string, formData, url?: string) => void;
  updateSkillSetting: (skillId: string, skillsData: SkillSetting) => Promise<void>;
}

export interface Shell {
  api: ShellApi;
  data: ShellData;
}

export interface Shell {
  api: ShellApi;
  data: ShellData;
}
