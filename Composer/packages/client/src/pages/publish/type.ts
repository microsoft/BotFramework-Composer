// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DialogSetting, PublishResult, PublishTarget } from '@bfc/shared';

import { PublishType } from '../../recoilModel/types';

export interface BotStatus {
  id: string;
  name: string;
  publishTargets?: PublishTarget[];
  publishTarget?: string;
  time?: string;
  status?: number;
  message?: string;
  comment?: string;
}

export interface Bot {
  id: string;
  name: string;
  publishTarget: string;
}

interface BotProperty {
  setting: DialogSetting;
  publishTargets: PublishTarget[];
  publishTypes: PublishType[];
}
export type BotPropertyType = {
  [key: string]: BotProperty;
};

export type BotPublishHistory = Record<string, Record<string, PublishResult[]>>;
