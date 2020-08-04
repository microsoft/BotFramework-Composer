// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as restify from 'restify';
import { ConversationState, MemoryStorage, UserState } from "botbuilder";
import { ComposerBot } from "./shared/composerBot";
import { getBotAdapter, configureSkillEndpoint, configureMessageEndpoint, getServerPort, configureManifestsEndpoint } from './shared/helpers';

// Create shared user state and conversation state instances.
const memoryStorage = new MemoryStorage();
const userState = new UserState(memoryStorage);
const conversationState = new ConversationState(memoryStorage);

// Create HTTP server.
const server = restify.createServer({ maxParamLength: 1000 });

// Get botframework adapter.
const adapter = getBotAdapter(userState, conversationState);

// Create composer bot instance with root dialog.
const bot = new ComposerBot(userState, conversationState);

// Configure message endpoint.
configureMessageEndpoint(server, adapter, bot);

// Configure skill endpoint.
configureSkillEndpoint(server, adapter, bot);

// Configure manifests endpoint.
configureManifestsEndpoint(server);

// Get port and listen.
const port = getServerPort();
server.listen(port, (): void => {
  console.log(
    `\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`
  );
  console.log(
    `\nTo talk to your bot, open http://localhost:${ port }/api/messages in the Emulator.`
  );
});