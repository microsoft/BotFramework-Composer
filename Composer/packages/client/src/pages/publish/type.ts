// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DialogSetting, PublishResult, PublishTarget } from '@bfc/shared';

import { PublishType } from '../../recoilModel/types';

export type BotStatus = {
  id: string;
  name: string;
  publishTargets?: PublishTarget[];
  publishTarget?: string;
  time?: string;
  status?: number;
  message?: string;
  comment?: string;
};
export type Bot = {
  id: string;
  name: string;
  publishTarget: string;
};

export type BotSetting = {
  projectId: string;
  setting: DialogSetting;
};

export type BotPublishTargets = {
  projectId: string;
  publishTargets: PublishTarget[];
};

export type BotPublishType = {
  projectId: string;
  publishTypes: PublishType[];
};

export type BotPublishHistory = {
  projectId: string;
  publishHistory: Record<string, PublishResult[]>;
};
