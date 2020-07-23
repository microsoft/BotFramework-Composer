// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as restify from "restify";
import * as fs from "fs";
import * as path from "path";
import { BotFrameworkAdapter } from "botbuilder";
import { TurnContext } from "botbuilder-core";
import {
  AdaptiveDialogComponentRegistration,
  LanguageGeneratorMiddleWare,
} from "botbuilder-dialogs-adaptive";
import { ResourceExplorer } from "botbuilder-dialogs-declarative";
import { ComposerBot } from "./shared/composerBot";
import { BotSettings } from "./shared/settings";
// Create HTTP server.
const server = restify.createServer();
const argv = require("minimist")(process.argv.slice(2));
// prefer the argv port --port=XXXX over process.env because the parent Composer app uses that.
const port = argv.port || process.env.port || process.env.PORT || 3979;

export const getProjectRoot = (): string => {
  // get the root folder according to environment
  if (process.env.node_environment === "production") {
    return path.join(__dirname, "../azurewebapp/ComposerDialogs");
  } else {
    return path.join(__dirname, "../../");
  }
};

export const getRootDialog = (projRoot: string): string => {
  // Find entry dialog file
  let mainDialog = "main.dialog";
  const files = fs.readdirSync(projRoot);
  for (let file of files) {
    if (file.endsWith(".dialog")) {
      mainDialog = file;
      break;
    }
  }
  return mainDialog;
};

export const Configure = (projRoot: string) => {
  // Create resource explorer.
  const resourceExplorer = new ResourceExplorer().addFolders(
    projRoot,
    ["runtime"],
    false
  );
  resourceExplorer.addComponent(
    new AdaptiveDialogComponentRegistration(resourceExplorer)
  );
  const settings = getSettings(projRoot);
  // Create adapter.
  // See https://aka.ms/about-bot-adapter to learn more about .bot file its use and bot configuration.
  const adapter = new BotFrameworkAdapter({
    appId: process.env.microsoftAppID || settings.MicrosoftAppId,
    appPassword:
      process.env.microsoftAppPassword || settings.MicrosoftAppPassword,
  });
  adapter.use(new LanguageGeneratorMiddleWare(resourceExplorer));

  // get settings
  const bot = new ComposerBot(
    resourceExplorer,
    getRootDialog(projRoot),
    settings
  );

  return { adapter, bot };
};

export const getSettings = (projectRoot: string) => {
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
  return settings;
};

const projectRoot = getProjectRoot();
const { adapter, bot } = Configure(projectRoot);

server.listen(port, (): void => {
  console.log(
    `\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`
  );
  console.log(
    `\nTo talk to your bot, open http://localhost:${port}/api/messages in the Emulator.`
  );
});

server.post("/api/messages", (req, res): void => {
  adapter.processActivity(
    req,
    res,
    async (context: TurnContext): Promise<any> => {
      // Route activity to bot.
      await bot.onTurn(context);
    }
  );
});
