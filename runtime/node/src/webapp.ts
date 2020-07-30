// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as restify from "restify";
import * as fs from "fs";
import * as path from "path";
import { BotFrameworkAdapter, BotFrameworkAdapterSettings, ChannelServiceRoutes, ConversationState, InputHints, MemoryStorage, SkillHandler, SkillHttpClient, TurnContext, UserState } from "botbuilder";
import { AdaptiveDialogComponentRegistration } from "botbuilder-dialogs-adaptive";
import { ResourceExplorer } from "botbuilder-dialogs-declarative";
import { AuthenticationConfiguration, Claim, JwtTokenValidation, SimpleCredentialProvider, SkillValidation } from 'botframework-connector';
import { ComposerBot } from "./shared/composerBot";
import { BotSettings } from "./shared/settings";
import { SkillConversationIdFactory } from './shared/skillConversationIdFactory';
import { SkillsConfiguration } from './shared/skillsConfiguration';


export const getProjectRoot = (): string => {
  // get the root folder according to environment
  if (process.env.node_environment === "production") {
    return path.join(__dirname, "../azurewebapp/ComposerDialogs");
  } else {
    return path.join(__dirname, "../../");
  }
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

export const getBotAdapter = (settings: BotSettings, userState: UserState, conversationState: ConversationState): BotFrameworkAdapter => {
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
}

export const getSettings = (projectRoot: string): BotSettings => {
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

// Create HTTP server.
const server = restify.createServer();
const argv = require("minimist")(process.argv.slice(2));
// prefer the argv port --port=XXXX over process.env because the parent Composer app uses that.
const port = argv.port || process.env.port || process.env.PORT || 3979;

server.listen(port, (): void => {
  console.log(
    `\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`
  );
  console.log(
    `\nTo talk to your bot, open http://localhost:${ port }/api/messages in the Emulator.`
  );
});

const memoryStorage = new MemoryStorage();
const projectRoot = getProjectRoot();
const rootDialog = getRootDialog(projectRoot);
const settings = getSettings(projectRoot);

const userState = new UserState(memoryStorage);
const conversationState = new ConversationState(memoryStorage);

const adapter = getBotAdapter(settings, userState, conversationState);

// Create resource explorer.
const resourceExplorer = new ResourceExplorer();
resourceExplorer.addFolders(projectRoot, ["runtime"], false);
resourceExplorer.addComponent(new AdaptiveDialogComponentRegistration(resourceExplorer));

const conversationIdFactory = new SkillConversationIdFactory();
const credentialProvider = new SimpleCredentialProvider(settings.microsoftAppId, settings.microsoftAppPassword);
const skillClient = new SkillHttpClient(credentialProvider, conversationIdFactory);
const defaultLocale = settings.defaultLanguage || 'en-us';

const bot = new ComposerBot(
  conversationState,
  userState,
  resourceExplorer,
  skillClient,
  conversationIdFactory,
  undefined,
  rootDialog,
  defaultLocale,
  settings.feature && settings.feature.removeRecipientMention || false
);

// Create and initialize the skill classes
const skillsConfig = new SkillsConfiguration(settings);
// Load the appIds for the configured skills (we will only allow responses from skills we have configured).
const allowedSkills = Object.values(skillsConfig.skills).map(skill => skill.appId);
const allowedSkillsClaimsValidator = async (claims: Claim[]) => {
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
const authConfig = new AuthenticationConfiguration([], allowedSkillsClaimsValidator);
const handler = new SkillHandler(adapter, bot, conversationIdFactory, credentialProvider, authConfig);
const skillEndpoint = new ChannelServiceRoutes(handler);
skillEndpoint.register(server, '/api/skills');

server.post("/api/messages", (req, res): void => {
  adapter.processActivity(
    req,
    res,
    async (context: TurnContext): Promise<any> => {
      // Route activity to bot.
      await bot.onTurnActivity(context);
    }
  );
});
