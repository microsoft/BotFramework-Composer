// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import {
  Activity,
  ConversationState,
  MemoryStorage,
  UserState,
  SkillHandler,
  TurnContext,
  WebResponse,
} from 'botbuilder';
import { AuthenticationConfiguration, SimpleCredentialProvider } from 'botframework-connector';
import { ComposerBot } from './shared/composerBot';
import { getBotAdapter, getSettings } from './shared/helpers';
import { SkillConversationIdFactory } from './shared/skillConversationIdFactory';

// Create shared memory storage.
const memoryStorage = new MemoryStorage();

// Create shared user state and conversation state instances.
const userState = new UserState(memoryStorage);
const conversationState = new ConversationState(memoryStorage);

// Create shared skill conversation id factory instance.
const skillConversationIdFactory = new SkillConversationIdFactory();

// Get botframework adapter.
const adapter = getBotAdapter(userState, conversationState);

// Create composer bot instance with root dialog.
const bot = new ComposerBot(userState, conversationState, skillConversationIdFactory);

export const messagesTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  context.log('Messages endpoint triggerd.');

  // Delegate the processing of the HTTP POST to the adapter.
  // The adapter will invoke the bot.
  await adapter.processActivity(req, context.res as WebResponse, async function (
    turnContext: TurnContext
  ): Promise<void> {
    // Route activity to bot.
    await bot.onTurnActivity(turnContext);
  });
};

const settings = getSettings();
const credentialProvider = new SimpleCredentialProvider(settings.MicrosoftAppId, settings.MicrosoftAppPassword);
const authConfig = new AuthenticationConfiguration([]);
const skillHandler = new SkillHandler(adapter, bot, skillConversationIdFactory, credentialProvider, authConfig);

export const skillsTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  context.log('Skill replyToActivity endpoint triggered.');

  const conversationId = context.bindingData.conversationId;
  const activityId = context.bindingData.activityId;

  const authHeader = req.headers.authorization || req.headers.Authorization || '';
  const activity = JSON.parse(req.body) as Activity;
  const result = await skillHandler.handleReplyToActivity(authHeader, conversationId, activityId, activity);
  const res = context.res as WebResponse;
  res.status(200);
  res.send(result);
  res.end();

  context.done();
};
