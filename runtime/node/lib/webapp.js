"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettings = exports.getBotAdapter = exports.getRootDialog = exports.getProjectRoot = void 0;
const restify = require("restify");
const fs = require("fs");
const path = require("path");
const botbuilder_1 = require("botbuilder");
const botbuilder_dialogs_adaptive_1 = require("botbuilder-dialogs-adaptive");
const botbuilder_dialogs_declarative_1 = require("botbuilder-dialogs-declarative");
const botframework_connector_1 = require("botframework-connector");
const composerBot_1 = require("./shared/composerBot");
const skillConversationIdFactory_1 = require("./shared/skillConversationIdFactory");
const skillsConfiguration_1 = require("./shared/skillsConfiguration");
exports.getProjectRoot = () => {
    // get the root folder according to environment
    if (process.env.node_environment === "production") {
        return path.join(__dirname, "../azurewebapp/ComposerDialogs");
    }
    else {
        return path.join(__dirname, "../../");
    }
};
exports.getRootDialog = (folderPath) => {
    // Find entry dialog file
    let rootDialog = "main.dialog";
    const files = fs.readdirSync(folderPath);
    for (let file of files) {
        if (file.endsWith(".dialog")) {
            rootDialog = file;
            break;
        }
    }
    return rootDialog;
};
exports.getBotAdapter = (settings, userState, conversationState) => {
    const adapterSettings = {
        appId: settings.MicrosoftAppId,
        appPassword: settings.MicrosoftAppPassword
    };
    const adapter = new botbuilder_1.BotFrameworkAdapter(adapterSettings);
    adapter.onTurnError = async (turnContext, error) => {
        try {
            // Send a message to the user.
            let onTurnErrorMessage = 'The bot encountered an error or bug.';
            await turnContext.sendActivity(onTurnErrorMessage, onTurnErrorMessage, botbuilder_1.InputHints.IgnoringInput);
            onTurnErrorMessage = 'To continue to run this bot, please fix the bot source code.';
            await turnContext.sendActivity(onTurnErrorMessage, onTurnErrorMessage, botbuilder_1.InputHints.ExpectingInput);
            // Send a trace activity, which will be displayed in Bot Framework Emulator.
            await turnContext.sendTraceActivity('OnTurnError Trace', `${error}`, 'https://www.botframework.com/schemas/error', 'TurnError');
        }
        catch (err) {
            console.error(`\n [onTurnError] Exception caught in sendErrorMessage: ${err}`);
        }
        await conversationState.clear(turnContext);
        await conversationState.saveChanges(turnContext);
    };
    return adapter;
};
exports.getSettings = (projectRoot) => {
    // Find settings json file
    let settings = {};
    // load appsettings.json
    const appsettingsPath = path.join(projectRoot, "settings/appsettings.json");
    if (fs.existsSync(appsettingsPath)) {
        const items = require(appsettingsPath);
        settings = Object.assign(settings, items); // merge settings
    }
    // load generated settings
    const generatedPath = path.join(projectRoot, "generated");
    if (fs.existsSync(generatedPath)) {
        const generatedFiles = fs.readdirSync(generatedPath);
        for (let file of generatedFiles) {
            if (file.endsWith(".json")) {
                const items = require(path.join(generatedPath, file));
                settings.luis = Object.assign(settings.luis, items.luis); // merge luis settings
            }
        }
    }
    // load settings from arguments
    for (let key in argv) {
        if (key.indexOf(":") >= 0) {
            const segments = key.split(":");
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
    settings.MicrosoftAppId = settings.MicrosoftAppId || process.env.MicrosoftAppId;
    settings.MicrosoftAppPassword = settings.MicrosoftAppPassword || process.env.MicrosoftAppPassword;
    return settings;
};
// Create HTTP server.
const server = restify.createServer();
const argv = require("minimist")(process.argv.slice(2));
// prefer the argv port --port=XXXX over process.env because the parent Composer app uses that.
const port = argv.port || process.env.port || process.env.PORT || 3979;
server.listen(port, () => {
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
    console.log(`\nTo talk to your bot, open http://localhost:${port}/api/messages in the Emulator.`);
});
const memoryStorage = new botbuilder_1.MemoryStorage();
const projectRoot = exports.getProjectRoot();
const rootDialog = exports.getRootDialog(projectRoot);
const settings = exports.getSettings(projectRoot);
const userState = new botbuilder_1.UserState(memoryStorage);
const conversationState = new botbuilder_1.ConversationState(memoryStorage);
const adapter = exports.getBotAdapter(settings, userState, conversationState);
// Create resource explorer.
const resourceExplorer = new botbuilder_dialogs_declarative_1.ResourceExplorer();
resourceExplorer.addFolders(projectRoot, ["runtime"], false);
resourceExplorer.addComponent(new botbuilder_dialogs_adaptive_1.AdaptiveDialogComponentRegistration(resourceExplorer));
const conversationIdFactory = new skillConversationIdFactory_1.SkillConversationIdFactory();
const credentialProvider = new botframework_connector_1.SimpleCredentialProvider(settings.microsoftAppId, settings.microsoftAppPassword);
const skillClient = new botbuilder_1.SkillHttpClient(credentialProvider, conversationIdFactory);
const defaultLocale = settings.defaultLanguage || 'en-us';
const bot = new composerBot_1.ComposerBot(conversationState, userState, resourceExplorer, skillClient, conversationIdFactory, undefined, rootDialog, defaultLocale, settings.feature && settings.feature.removeRecipientMention || false);
// Create and initialize the skill classes
const skillsConfig = new skillsConfiguration_1.SkillsConfiguration(settings);
// Load the appIds for the configured skills (we will only allow responses from skills we have configured).
const allowedSkills = Object.values(skillsConfig.skills).map(skill => skill.appId);
const allowedSkillsClaimsValidator = async (claims) => {
    // For security, developer must specify allowedSkills.
    if (!allowedSkills || allowedSkills.length === 0) {
        throw new Error('Allowed skills not specified');
    }
    if (!allowedSkills.includes('*') && botframework_connector_1.SkillValidation.isSkillClaim(claims)) {
        // Check that the appId claim in the skill request is in the list of skills configured for this bot.
        const appId = botframework_connector_1.JwtTokenValidation.getAppIdFromClaims(claims);
        if (!allowedSkills.includes(appId)) {
            throw new Error(`Received a request from an application with an appID of "${appId}". To enable requests from this skill, add the skill to your configuration file.`);
        }
    }
};
const authConfig = new botframework_connector_1.AuthenticationConfiguration([], allowedSkillsClaimsValidator);
const handler = new botbuilder_1.SkillHandler(adapter, bot, conversationIdFactory, credentialProvider, authConfig);
const skillEndpoint = new botbuilder_1.ChannelServiceRoutes(handler);
skillEndpoint.register(server, '/api/skills');
server.post("/api/messages", (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Route activity to bot.
        await bot.onTurnActivity(context);
    });
});
//# sourceMappingURL=webapp.js.map