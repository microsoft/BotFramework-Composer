// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as restify from 'restify';
import { ConversationState, MemoryStorage, UserState } from 'botbuilder';
import {
  ApplicationInsightsTelemetryClient,
  ApplicationInsightsWebserverMiddleware,
  TelemetryInitializerMiddleware,
} from 'botbuilder-applicationinsights';
import { ComposerBot } from './shared/composerBot';
import {
  getBotAdapter,
  configureSkillEndpoint,
  configureMessageEndpoint,
  getServerPort,
  configureManifestsEndpoint,
  configureTelemetry,
  getTelemetryClient,
} from './shared/helpers';
import { SkillConversationIdFactory } from './shared/skillConversationIdFactory';
import debug from 'debug';

const logger = debug('composer:runtime:nodejs');

// Create shared memory storage.
const memoryStorage = new MemoryStorage();

// Create shared user state and conversation state instances.
const userState = new UserState(memoryStorage);
const conversationState = new ConversationState(memoryStorage);

// Create shared skill conversation id factory instance.
const skillConversationIdFactory = new SkillConversationIdFactory();

// Create HTTP server.
const server = restify.createServer({ maxParamLength: 1000 });

// Get botframework adapter.
const adapter = getBotAdapter(memoryStorage, userState, conversationState);

// Get bot telemetry client.
const telemetryClient = getTelemetryClient();

// Create composer bot instance with root dialog.
const bot = new ComposerBot(userState, conversationState, skillConversationIdFactory, telemetryClient);

// Configure message endpoint.
configureMessageEndpoint(server, adapter, bot);

// Configure skill endpoint.
configureSkillEndpoint(server, adapter, bot, skillConversationIdFactory);

// Configure manifests endpoint.
configureManifestsEndpoint(server);

// Configure telemetry client, initializers and middleware.
configureTelemetry(server, adapter, telemetryClient);

// Get port and listen.
const port = getServerPort();
server.listen(port, (): void => {
  logger(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
  logger(`\nTo talk to your bot, open http://localhost:${port}/api/messages in the Emulator.`);
});
