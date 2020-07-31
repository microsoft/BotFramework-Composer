"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureSkillEndpoint = exports.configureMessageEndpoint = exports.allowedSkillsClaimsValidator = exports.getBotAdapter = exports.getRootDialog = exports.getSettings = exports.getProjectRoot = exports.getServerPort = void 0;
const fs = require("fs");
const minimist = require("minimist");
const path = require("path");
const botbuilder_1 = require("botbuilder");
const botframework_connector_1 = require("botframework-connector");
const skillsConfiguration_1 = require("./skillsConfiguration");
const skillConversationIdFactory_1 = require("./skillConversationIdFactory");
exports.getServerPort = () => {
    const argv = minimist(process.argv.slice(2));
    // prefer the argv port --port=XXXX over process.env because the parent Composer app uses that.
    const port = argv.port || process.env.port || process.env.PORT || 3979;
    return port;
};
exports.getProjectRoot = () => {
    // get the root folder according to environment
    if (process.env.node_environment === "production") {
        return path.join(__dirname, "../../azurewebapp/ComposerDialogs");
    }
    else {
        return path.join(__dirname, "../../../");
    }
};
exports.getSettings = (projectRoot) => {
    if (!projectRoot) {
        projectRoot = exports.getProjectRoot();
    }
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
    const argv = minimist(process.argv.slice(2));
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
exports.getBotAdapter = (userState, conversationState) => {
    const settings = exports.getSettings();
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
exports.allowedSkillsClaimsValidator = async (claims) => {
    const settings = exports.getSettings();
    // Create and initialize the skill classes
    const skillsConfig = new skillsConfiguration_1.SkillsConfiguration(settings);
    // Load the appIds for the configured skills (we will only allow responses from skills we have configured).
    const allowedSkills = Object.values(skillsConfig.skills).map(skill => skill.appId);
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
exports.configureMessageEndpoint = (server, adapter, bot) => {
    server.post("/api/messages", (req, res) => {
        adapter.processActivity(req, res, async (context) => {
            // Route activity to bot.
            await bot.onTurnActivity(context);
        });
    });
};
exports.configureSkillEndpoint = (server, adapter, bot) => {
    const settings = exports.getSettings();
    const conversationIdFactory = new skillConversationIdFactory_1.SkillConversationIdFactory();
    const credentialProvider = new botframework_connector_1.SimpleCredentialProvider(settings.microsoftAppId, settings.microsoftAppPassword);
    const authConfig = new botframework_connector_1.AuthenticationConfiguration([], exports.allowedSkillsClaimsValidator);
    const handler = new botbuilder_1.SkillHandler(adapter, bot, conversationIdFactory, credentialProvider, authConfig);
    const skillEndpoint = new botbuilder_1.ChannelServiceRoutes(handler);
    skillEndpoint.register(server, '/api/skills');
};
//# sourceMappingURL=helpers.js.map