// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as fs from "fs";
import * as minimist from 'minimist';
import * as path from "path";
import { Server } from 'restify';
import { BotFrameworkAdapter, BotFrameworkAdapterSettings, ChannelServiceRoutes, ConversationState, InputHints, SkillHandler, TurnContext, UserState, WebRequest, WebResponse } from "botbuilder";
import { AuthenticationConfiguration, Claim, JwtTokenValidation, SimpleCredentialProvider, SkillValidation } from 'botframework-connector';
import { ComposerBot } from './composerBot';
import { BotSettings } from "./settings";
import { SkillsConfiguration } from './skillsConfiguration';
import { SkillConversationIdFactory } from './skillConversationIdFactory';

export const getServerPort = () => {
    const argv = minimist(process.argv.slice(2));
    // prefer the argv port --port=XXXX over process.env because the parent Composer app uses that.
    const port = argv.port || process.env.port || process.env.PORT || 3979;
    return port;
};

export const getProjectRoot = (): string => {
    // get the root folder according to environment
    if (process.env.node_environment === "production") {
        return path.join(__dirname, "../../azurewebapp/ComposerDialogs");
    } else {
        return path.join(__dirname, "../../../");
    }
};

export const getSettings = (projectRoot?: string): BotSettings => {
    if (!projectRoot) {
        projectRoot = getProjectRoot();
    }
    // Find settings json file
    let settings = {} as BotSettings;
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
            const segments: string[] = key.split(":");
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
    settings.MicrosoftAppId = settings.MicrosoftAppId || process.env.MicrosoftAppId;
    settings.MicrosoftAppPassword = settings.MicrosoftAppPassword || process.env.MicrosoftAppPassword;
    return settings;
};

export const getRootDialog = (folderPath: string): string => {
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

export const getBotAdapter = (userState: UserState, conversationState: ConversationState): BotFrameworkAdapter => {
    const settings = getSettings();
    const adapterSettings: Partial<BotFrameworkAdapterSettings> = {
        appId: settings.MicrosoftAppId,
        appPassword: settings.MicrosoftAppPassword
    };
    const adapter = new BotFrameworkAdapter(adapterSettings);
    adapter.onTurnError = async (turnContext: TurnContext, error: Error) => {
        try {
            // Send a message to the user.
            let onTurnErrorMessage = 'The bot encountered an error or bug.';
            await turnContext.sendActivity(onTurnErrorMessage, onTurnErrorMessage, InputHints.IgnoringInput);

            onTurnErrorMessage = 'To continue to run this bot, please fix the bot source code.';
            await turnContext.sendActivity(onTurnErrorMessage, onTurnErrorMessage, InputHints.ExpectingInput);

            // Send a trace activity, which will be displayed in Bot Framework Emulator.
            await turnContext.sendTraceActivity(
                'OnTurnError Trace',
                `${ error }`,
                'https://www.botframework.com/schemas/error',
                'TurnError'
            );
        } catch (err) {
            console.error(`\n [onTurnError] Exception caught in sendErrorMessage: ${ err }`);
        }
        await conversationState.clear(turnContext);
        await conversationState.saveChanges(turnContext);
    };
    return adapter;
};

export const allowedSkillsClaimsValidator = async (claims: Claim[]) => {
    const settings = getSettings();
    // Create and initialize the skill classes
    const skillsConfig = new SkillsConfiguration(settings);
    // Load the appIds for the configured skills (we will only allow responses from skills we have configured).
    const allowedSkills = Object.values(skillsConfig.skills).map(skill => skill.appId);
    // For security, developer must specify allowedSkills.
    if (!allowedSkills || allowedSkills.length === 0) {
        throw new Error('Allowed skills not specified');
    }
    if (!allowedSkills.includes('*') && SkillValidation.isSkillClaim(claims)) {
        // Check that the appId claim in the skill request is in the list of skills configured for this bot.
        const appId = JwtTokenValidation.getAppIdFromClaims(claims);
        if (!allowedSkills.includes(appId)) {
            throw new Error(`Received a request from an application with an appID of "${ appId }". To enable requests from this skill, add the skill to your configuration file.`);
        }
    }
};

export const configureMessageEndpoint = (server: Server, adapter: BotFrameworkAdapter, bot: ComposerBot) => {
    server.post("/api/messages", (req: WebRequest, res: WebResponse): void => {
        adapter.processActivity(
            req,
            res,
            async (context: TurnContext): Promise<any> => {
                // Route activity to bot.
                await bot.onTurnActivity(context);
            }
        );
    });
};

export const configureSkillEndpoint = (server: Server, adapter: BotFrameworkAdapter, bot: ComposerBot) => {
    const settings = getSettings();
    const conversationIdFactory = new SkillConversationIdFactory();
    const credentialProvider = new SimpleCredentialProvider(settings.microsoftAppId, settings.microsoftAppPassword);
    const authConfig = new AuthenticationConfiguration([], allowedSkillsClaimsValidator);
    const handler = new SkillHandler(adapter, bot, conversationIdFactory, credentialProvider, authConfig);
    const skillEndpoint = new ChannelServiceRoutes(handler);
    skillEndpoint.register(server, '/api/skills');
};

export const configureManifestsEndpoint = (server: Server) => {
    const projectRoot = getProjectRoot();
    const manifestsPath= path.join(projectRoot, 'manifests');
    if (fs.existsSync(manifestsPath)) {
        const manifestFiles = fs.readdirSync(manifestsPath);
        for (let file of manifestFiles) {
            if (file.endsWith(".json")) {
                server.get(`/${ file }`, (_req, res): void => {
                    const manifest = require(path.join(manifestsPath, file));
                    res.send(manifest);
                });
            }
        }
    }
};