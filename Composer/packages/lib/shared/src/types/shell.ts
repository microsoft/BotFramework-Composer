// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-explicit-any */

import { DialogInfo, LuFile, LgFile, LuIntentSection, LgTemplate, DialogSchemaFile } from './indexers';
import { UserSettings } from './settings';
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
  userSettings: UserSettings;
  skills: any[];
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
  copyLgTemplate: (id: string, fromTemplateName: string, toTemplateName?: string) => void;
  addLgTemplate: (id: string, templateName: string, templateStr: string) => void;
  updateLgTemplate: (id: string, templateName: string, templateStr: string) => void;
  removeLgTemplate: (id: string, templateName: string) => void;
  removeLgTemplates: (id: string, templateNames: string[]) => void;
  getLuIntent: (id: string, intentName: string) => LuIntentSection | undefined;
  getLuIntents: (id: string) => LuIntentSection[];
  addLuIntent: (id: string, intentName: string, intent: LuIntentSection) => void;
  updateLuIntent: (id: string, intentName: string, intent: LuIntentSection) => void;
  renameLuIntent: (id: string, intentName: string, newIntentName: string) => void;
  removeLuIntent: (id: string, intentName: string) => void;
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
  addSkillDialog: () => Promise<{ manifestUrl: string } | null>;
  announce: (message: string) => void;
  displayManifestModal: (manifestId: string) => void;
  updateDialogSchema: (_: DialogSchemaFile) => Promise<void>;
}

export interface Shell {
  api: ShellApi;
  data: ShellData;
}
