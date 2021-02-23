// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DirectLineLogType } from '@botframework-composer/types';

export type ConversationAPIPathParameters = {
  conversationId: string;
  activityId: string;
};

export type User = {
  id: string;
  name: string;
};

export type WebChatMode = 'livechat' | 'transcript';

export enum LogItemType {
  Text = 'text',
}

export interface LogItem<T = { level: DirectLineLogType; text: string }> {
  type: LogItemType;
  payload: T;
}
