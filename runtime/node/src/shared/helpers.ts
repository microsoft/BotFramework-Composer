// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import fs from 'fs';
import minimist from 'minimist';
import path from 'path';
import { Server } from 'restify';
import merge from 'lodash/merge';
import {
  BotFrameworkAdapter,
  BotFrameworkAdapterSettings,
  ChannelServiceRoutes,
  ConversationState,
  InputHints,
  SkillHandler,
  TurnContext,
  UserState,
  WebRequest,
  WebResponse,
  Activity,
  StatusCodeError,
  StatusCodes,
} from 'botbuilder';
import { AuthenticationConfiguration, SimpleCredentialProvider } from 'botframework-connector';
import { ComposerBot } from './composerBot';
import { BotSettings } from './settings';
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
  if (process.env.runtime_environment === 'production') {
    return path.join(__dirname, '../../azurewebapp/ComposerDialogs');
  } else {
    return path.join(__dirname, '../../../');
  }
};

/**
 * Get bot settings from configuration file, generated luis configuration or arguments.
 * @param projectRoot Root path of bot project.
 */
export const getSettings = (projectRoot = getProjectRoot()): BotSettings => {
  // Find settings json file
  let settings = {} as BotSettings;
  // load appsettings.json
  const appsettingsPath = path.join(projectRoot, 'settings/appsettings.json');
  if (fs.existsSync(appsettingsPath)) {
    settings = JSON.parse(fs.readFileSync(appsettingsPath, 'utf8'));
  }

  // load generated settings
  const generatedPath = path.join(projectRoot, 'generated');
  if (fs.existsSync(generatedPath)) {
    const generatedFiles = fs.readdirSync(generatedPath);
    for (const file of generatedFiles) {
      if (file.endsWith('.json')) {
        const generatedSettings = JSON.parse(fs.readFileSync(path.join(generatedPath, file), 'utf8'));
        merge(settings, generatedSettings);
      }
    }
  }

  // load settings from arguments
  const argv = minimist(process.argv.slice(2));
  for (const key in argv) {
    if (key.includes(':')) {
      const segments: string[] = key.split(':');
      let base = settings;
      segments.forEach((segment, index) => {
        if (!Object.prototype.hasOwnProperty.call(base, segment)) {
          base[segment] = {};
        }

        if (index === segments.length - 1) {
          base[segment] = argv[key];
        } else {
          base = base[segment];
        }
      });
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
  const files = fs.readdirSync(folderPath);
  const rootDialog = files.find((file) => file.endsWith('.dialog')) ?? 'main.dialog';
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
    appPassword: settings.MicrosoftAppPassword,
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
        `${error}`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
      );
    } catch (err) {
      console.error(`\n [onTurnError] Exception caught in sendErrorMessage: ${err}`);
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
  server.post('/api/messages', (req: WebRequest, res: WebResponse): void => {
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
export const configureSkillEndpoint = (
  server: Server,
  adapter: BotFrameworkAdapter,
  bot: ComposerBot,
  skillConversationIdFactory: SkillConversationIdFactory
) => {
  const settings = getSettings();
  const credentialProvider = new SimpleCredentialProvider(settings.MicrosoftAppId, settings.MicrosoftAppPassword);
  const authConfig = new AuthenticationConfiguration([]);
  const handler = new SkillHandler(adapter, bot, skillConversationIdFactory, credentialProvider, authConfig);
  const skillEndpoint = new ChannelServiceRoutes(handler);
  skillEndpoint.register(server, '/api/skills');
};

/**
 * Configure a server to serve manifest files.
 * @param server Web server to be configured.
 */
export const configureManifestsEndpoint = (server: Server) => {
  const projectRoot = getProjectRoot();
  const manifestsPath = path.join(projectRoot, 'manifests');
  if (fs.existsSync(manifestsPath)) {
    const manifestFiles = fs.readdirSync(manifestsPath);
    for (const file of manifestFiles) {
      if (file.endsWith('.json')) {
        server.get(`/${file}`, (_req, res): void => {
          const manifest = JSON.parse(fs.readFileSync(path.join(manifestsPath, file), 'utf8'));
          res.send(manifest);
        });
      }
    }
  }
};
