// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as restify from 'restify';
import * as fs from 'fs';
import * as path from 'path';
import { BotFrameworkAdapter, MemoryStorage, ConversationState, UserState } from 'botbuilder';
import { DialogManager } from 'botbuilder-dialogs';
import { AdaptiveDialog, AdaptiveDialogComponentRegistration, LanguageGeneratorMiddleWare } from 'botbuilder-dialogs-adaptive';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';

// Create HTTP server.
const server = restify.createServer();
const argv = require('minimist')(process.argv.slice(2));
server.listen(process.env.port || process.env.PORT || argv.port || 3978, (): void => {
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
    console.log(`\nTo talk to your bot, open echobot.bot file in the Emulator.`);
});

// Load project settings
let projectSettings = {
    bot: '../../',
    root: '../../'
};
if (process.env.node_environment === 'production') {
    projectSettings = require('../appsettings.deployment.json');
} else {
    projectSettings = require('../appsettings.development.json');
}

const projectRoot = path.join(__dirname, '../', projectSettings.root);

// Find entry dialog file
let mainDialog = 'main.dialog';
const files = fs.readdirSync(projectRoot);
for (let file of files) {
    if (file.endsWith('.dialog')) {
        mainDialog = file;
        break;
    }
}

// Create resource explorer.
const resourceExplorer = new ResourceExplorer().addFolders(projectRoot, ['runtime'], false)
resourceExplorer.addComponent(new AdaptiveDialogComponentRegistration(resourceExplorer));

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about .bot file its use and bot configuration.
const adapter = new BotFrameworkAdapter({
    appId: process.env.microsoftAppID,// || '97f8a0c9-93d0-4bad-a3e3-30b1aaf79aa0',
    appPassword: process.env.microsoftAppPassword,// || '4ve=H:PYD?.NXn9jHORhW8e9mr9SSnm_',
});
adapter.use(new LanguageGeneratorMiddleWare(resourceExplorer));

const bot = new DialogManager();
bot.userState = new UserState(new MemoryStorage());
bot.conversationState = new ConversationState(new MemoryStorage());
bot.rootDialog = resourceExplorer.loadType(mainDialog) as AdaptiveDialog;

// Find settings json file
let settings = {};
// load appsettings.json 
const appsettingsPath = path.join(projectRoot, 'settings/appsettings.json');
if (fs.existsSync(appsettingsPath)) {
    const items = require(appsettingsPath);
    settings = Object.assign(settings, items); // merge settings
}

// load generated settings
const generatedPath = path.join(projectRoot, 'generated');
if (fs.existsSync(generatedPath)) {
    const generatedFiles = fs.readdirSync(generatedPath);
    for (let file of generatedFiles) {
        if (file.endsWith('.json')) {
            const items = require(path.join(generatedPath, file));
            settings = Object.assign(settings, items); // merge settings
        }
    }
}

// merge with project settings
settings = Object.assign(settings, projectSettings);

// load settings from arguments
for (let key in argv) {
    if (key.indexOf(':') >= 0) {
        const segments: string[] = key.split(':');
        let base = settings;
        for (let i = 0; i < segments.length - 1; i++) {
            const segment = segments[i];
            if (!base.hasOwnProperty(segment)) {
                base[segment] = {};
            }
            base = base[segment];
        }
        base[segments[segments.length - 1]] = argv[key];
    } else {
        settings[key] = argv[key];
    }
}
console.log(settings);
bot.initialTurnState.set('settings', settings);

server.post('/api/messages', (req, res): void => {
    adapter.processActivity(req, res, async (context): Promise<any> => {
        // Route activity to bot.
        await bot.onTurn(context);
    });
});