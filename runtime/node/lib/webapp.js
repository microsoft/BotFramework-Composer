"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const restify = require("restify");
const botbuilder_1 = require("botbuilder");
const composerBot_1 = require("./shared/composerBot");
const helpers_1 = require("./shared/helpers");
// Create shared user state and conversation state instances.
const memoryStorage = new botbuilder_1.MemoryStorage();
const userState = new botbuilder_1.UserState(memoryStorage);
const conversationState = new botbuilder_1.ConversationState(memoryStorage);
// Create HTTP server.
const server = restify.createServer();
// Get botframework adapter.
const adapter = helpers_1.getBotAdapter(userState, conversationState);
// Create composer bot instance with root dialog.
const bot = new composerBot_1.ComposerBot(userState, conversationState);
// Configure message endpoint.
helpers_1.configureMessageEndpoint(server, adapter, bot);
// Configure skill endpoint.
helpers_1.configureSkillEndpoint(server, adapter, bot);
// Get port and listen.
const port = helpers_1.getServerPort();
server.listen(port, () => {
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
    console.log(`\nTo talk to your bot, open http://localhost:${port}/api/messages in the Emulator.`);
});
//# sourceMappingURL=webapp.js.map