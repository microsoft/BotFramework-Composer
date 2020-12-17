// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DialogSetting, PublishResult, PublishTarget } from '@bfc/shared';

import { PublishType } from '../../recoilModel/types';

export type IBotStatus = {
  id: string;
  name: string;
  publishTargets?: PublishTarget[];
  publishTarget?: string;
  time?: string;
  status?: number;
  message?: string;
  comment?: string;
};
export type IBot = {
  id: string;
  name: string;
  publishTarget: string;
};

export type IBotSetting = {
  projectId: string;
  setting: DialogSetting;
};

export type IBotPublishTargets = {
  projectId: string;
  publishTargets: PublishTarget[];
};

export type IBotPublishType = {
  projectId: string;
  publishTypes: PublishType[];
};

export type IBotPublishHistory = {
  projectId: string;
  publishHistory: { [key: string]: PublishResult[] };
};
