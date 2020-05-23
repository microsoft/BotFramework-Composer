"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const restify = require("restify");
const fs = require("fs");
const path = require("path");
const botbuilder_1 = require("botbuilder");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const botbuilder_dialogs_adaptive_1 = require("botbuilder-dialogs-adaptive");
const botbuilder_dialogs_declarative_1 = require("botbuilder-dialogs-declarative");
const argv = require('minimist')(process.argv.slice(2));
console.log(argv.port);
// Create HTTP server.
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || argv.port || 3978, () => {
    // console.log(`\n${ server.name } listening to ${ server.url }`);
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
    console.log(`\nTo talk to your bot, open echobot.bot file in the Emulator.`);
});
const projectPath = path.join(__dirname, '../../../');
console.log(projectPath);
// Find entry dialog file
let mainDialog = 'main.dialog';
const files = fs.readdirSync(projectPath);
console.log(files);
for (let file of files) {
    if (file.endsWith('.dialog')) {
        mainDialog = file;
        break;
    }
}
console.log(mainDialog);
// Create resource explorer.
const resourceExplorer = new botbuilder_dialogs_declarative_1.ResourceExplorer().addFolders(projectPath, ['runtime'], false);
resourceExplorer.addComponent(new botbuilder_dialogs_adaptive_1.AdaptiveDialogComponentRegistration(resourceExplorer));
// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about .bot file its use and bot configuration.
const adapter = new botbuilder_1.BotFrameworkAdapter({
    appId: process.env.microsoftAppID,
    appPassword: process.env.microsoftAppPassword,
});
adapter.use(new botbuilder_dialogs_adaptive_1.LanguageGeneratorMiddleWare(resourceExplorer));
const bot = new botbuilder_dialogs_1.DialogManager();
bot.userState = new botbuilder_1.UserState(new botbuilder_1.MemoryStorage());
bot.conversationState = new botbuilder_1.ConversationState(new botbuilder_1.MemoryStorage());
bot.rootDialog = resourceExplorer.loadType(mainDialog);
// Find settings json file
let settings = {};
// load appsettings.json 
const appsettingsPath = path.join(projectPath, 'settings/appsettings.json');
if (fs.existsSync(appsettingsPath)) {
    const items = require(appsettingsPath);
    settings = Object.assign(settings, items); // merge settings
}
// load generated settings
const generatedPath = path.join(projectPath, 'generated');
if (fs.existsSync(generatedPath)) {
    const generatedFiles = fs.readdirSync(generatedPath);
    for (let file of generatedFiles) {
        if (file.endsWith('.json')) {
            const items = require(path.join(generatedPath, file));
            settings = Object.assign(settings, items); // merge settings
        }
    }
}
// load settings from arguments
for (let key in argv) {
    if (key.indexOf(':') >= 0) {
        const segments = key.split(':');
        let base = settings;
        for (let i = 0; i < segments.length - 1; i++) {
            const segment = segments[i];
            if (!base.hasOwnProperty(segment)) {
                base[segment] = {};
            }
            base = base[segment];
        }
        base[segments[segments.length - 1]] = argv[key];
    }
    else {
        settings[key] = argv[key];
    }
}
console.log(settings);
bot.initialTurnState.set('settings', settings);
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Route activity to bot.
        await bot.onTurn(context);
    });
});
//# sourceMappingURL=index.js.map