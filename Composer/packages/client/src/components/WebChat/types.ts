// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type User = {
  id: string;
  name: string;
  role: string;
};

export type BotSecrets = { msAppId: string; msPassword: string };
export type ChannelService = 'public' | 'usgov';

export type WebChatMode = 'livechat' | 'transcript';
export type ConversationMember = {
  id: string;
  name: string;
  role?: string;
};

export type StartConversationPayload = {
  bot?: ConversationMember;
  botUrl: string;
  channelServiceType: ChannelService;
  members: ConversationMember[];
  mode: WebChatMode;
  locale: string;
  msaAppId?: string;
  msaPassword?: string;
};

// All activity types. Just parsing for Trace currently.
export enum ActivityType {
  Message = 'message',
  ContactRelationUpdate = 'contactRelationUpdate',
  ConversationUpdate = 'conversationUpdate',
  Typing = 'typing',
  EndOfConversation = 'endOfConversation',
  Event = 'event',
  Invoke = 'invoke',
  InvokeResponse = 'invokeResponse',
  DeleteUserData = 'deleteUserData',
  MessageUpdate = 'messageUpdate',
  MessageDelete = 'messageDelete',
  InstallationUpdate = 'installationUpdate',
  MessageReaction = 'messageReaction',
  Suggestion = 'suggestion',
  Trace = 'trace',
  Handoff = 'handoff',
}

export type ChatData = {
  webChatMode: WebChatMode;
  directline: {
    end: () => void;
  };
  projectId: string;
  user: User;
  conversationId: string;
  webChatStore: unknown;
};

export enum RestartOption {
  SameUserID,
  NewUserID,
}
