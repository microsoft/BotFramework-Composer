// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { AppUpdaterSettings, CodeEditorSettings, DialogInfo } from '@bfc/shared';

import { BreadcrumbItem } from '../store/types';

import { DialogSetting } from './../store/types';
import { SkillManifest } from './../pages/design/exportSkillModal/constants';
import { LuFile, LgFile } from './../../../lib/shared/src/types/indexers';

export type dialogPayload = {
  id: string;
  content: any;
  projectId: string;
};

export type DesignPageLocationPayload = {
  projectId: string;
  dialogId: string;
  selected: string;
  focused: string;
  breadcrumb: BreadcrumbItem[];
  promptTab?: string;
};

export type UserSettingsPayload = {
  appUpdater: Partial<AppUpdaterSettings>;
  codeEditor: Partial<CodeEditorSettings>;
  propertyEditorWidth: number;
  dialogNavWidth: number;
};

export type BotAssets = {
  projectId: string;
  dialogs: DialogInfo[];
  luFiles: LuFile[];
  lgFiles: LgFile[];
  skillManifests: SkillManifest[];
  setting: DialogSetting;
};
