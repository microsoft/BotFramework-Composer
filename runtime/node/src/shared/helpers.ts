// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as fs from "fs";
import * as minimist from 'minimist';
import * as path from "path";
import { Server } from 'restify';
import { BotFrameworkAdapter, BotFrameworkAdapterSettings, ChannelServiceRoutes, ConversationState, InputHints, SkillHandler, TurnContext, UserState, WebRequest, WebResponse } from "botbuilder";
import { AuthenticationConfiguration, SimpleCredentialProvider } from 'botframework-connector';
import { ComposerBot } from './composerBot';
import { BotSettings } from "./settings";
import { SkillConversationIdFactory } from './skillConversationIdFactory';

/**
 * Get listening port for listening from environment variables or arguments.
 */
export const getServerPort = () => {
    const argv = minimist(process.argv.slice(2));
    // prefer the argv port --port=XXXX over process.env because the parent Composer app uses that.
    const port = argv.port || process.env.port || process.env.PORT || 3979;
    return port;
};

/**
 * Get path of bot project.
 */
export const getProjectRoot = (): string => {
    // get the root folder according to environment
    if (process.env.node_environment === "production") {
        return path.join(__dirname, "../../azurewebapp/ComposerDialogs");
    } else {
        return path.join(__dirname, "../../../");
    }
};

/**
 * Get bot settings from configuration file, generated luis configuration or arguments.
 * @param projectRoot Root path of bot project.
 */
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

/**
 * Get root dialog of the bot project.
 * @param folderPath Path of bot project.
 */
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

/**
 * Get botframework adapter with user state and conversation state.
 * @param userState User state required by a botframework adapter.
 * @param conversationState Conversation state required by a botframework adapter.
 */
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

/**
 * Configure a server to work with botframework message requests.
 * @param server Web server to be configured.
 * @param adapter Botframework adapter to handle message requests.
 * @param bot Composer bot to process message requests.
 */
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

/**
 * Configure a server to work with botframework skill requests.
 * @param server Web server to be configured.
 * @param adapter Botframework adapter to handle skill requests.
 * @param bot Composer bot to process skill requests.
 */
export const configureSkillEndpoint = (server: Server, adapter: BotFrameworkAdapter, bot: ComposerBot) => {
    const settings = getSettings();
    const conversationIdFactory = new SkillConversationIdFactory();
    const credentialProvider = new SimpleCredentialProvider(settings.microsoftAppId, settings.microsoftAppPassword);
    const authConfig = new AuthenticationConfiguration([]);
    const handler = new SkillHandler(adapter, bot, conversationIdFactory, credentialProvider, authConfig);
    const skillEndpoint = new ChannelServiceRoutes(handler);
    skillEndpoint.register(server, '/api/skills');
};

/**
 * Configure a server to serve manifest files.
 * @param server Web server to be configured.
 */
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