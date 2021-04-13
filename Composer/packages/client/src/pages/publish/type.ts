// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DialogSetting, PublishResult, PublishTarget, SkillManifestFile } from '@bfc/shared';

import { PublishType } from '../../recoilModel/types';

export type BotStatus = {
  /** Skill id. */
  id: string;
  /** Skill name. */
  name: string;
  publishTargets?: PublishTarget[];
  publishTarget?: string;
  time?: string;
  status?: number;
  message?: string;
  comment?: string;
  /**
   * The skill manifest URL associated with the current publishTarget.
   */
  skillManifestUrl?: string;
};

export type Bot = {
  id: string;
  name: string;
  publishTarget: string;
};

type BotProperty = {
  setting: DialogSetting;
  publishTargets: PublishTarget[];
  publishTypes: PublishType[];
  skillManifests: SkillManifestFile[];
};

export type BotProjectType = {
  projectId: string;
  setting: DialogSetting;
  publishTypes: PublishType[];
  [key: string]: any;
};

export type BotPropertyType = {
  [key: string]: BotProperty;
};

export type BotPublishHistory = Record<string, Record<string, PublishResult[]>>;
