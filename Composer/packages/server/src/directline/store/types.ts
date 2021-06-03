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
