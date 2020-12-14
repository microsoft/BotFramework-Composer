// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DialogSetting, PublishTarget } from '@bfc/shared';
import { PublishType } from '../../recoilModel/types';

export interface IStatus {
  id: string;
  time: string;
  status: number;
  message: string;
  comment: string;
  log?: string;
  action?: {
    href: string;
    label: string;
  };
}
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
export type IBotPublishTarget = {
  id: string;
  name: string;
  publishTarget: string;
};

export type IBotSetting = {
  projectId: string;
  setting: DialogSetting;
};

export type IBotPublishType = {
  projectId: string;
  publishTypes: PublishType[];
};

export type IBotPublishHistory = {
  projectId: string;
  publishHistory: { [key: string]: IStatus[] };
};
