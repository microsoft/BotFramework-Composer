// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type ConversationAPIPathParameters = {
  conversationId: string;
  activityId: string;
};

export type User = {
  id: string;
  name: string;
};

export type WebChatMode = 'livechat' | 'transcript';

export type LoggerLevel = 'Debug' | 'Info' | 'Warn' | 'Error';

export enum LogItemType {
  Text = 'text',
}

export interface LogItem<T = { level: LoggerLevel; text: string }> {
  type: LogItemType;
  payload: T;
}
