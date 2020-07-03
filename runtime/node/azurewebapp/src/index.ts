// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as restify from "restify";
import * as fs from "fs";
import * as path from "path";
import {
  BotFrameworkAdapter,
  MemoryStorage,
  ConversationState,
  UserState,
} from "botbuilder";
import {
  AdaptiveDialogComponentRegistration,
  LanguageGeneratorMiddleWare,
} from "botbuilder-dialogs-adaptive";
import { ResourceExplorer } from "botbuilder-dialogs-declarative";
import { ComposerBot } from "../../core/src/index";

// Create HTTP server.
const server = restify.createServer();
const argv = require("minimist")(process.argv.slice(2));
// prefer the argv port --port=XXXX over process.env because the parent Composer app uses that.
const port = argv.port || process.env.port || process.env.PORT ||  3978;
server.listen(
  port,
  (): void => {
    console.log(
      `\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`
    );
    console.log(
      `\nTo talk to your bot, open http://localhost:${port}/api/messages in the Emulator.`
    );
  }
);

const getProjectRoot = (): string => {
  // Load project settings
  let projectSettings = {
    bot: "../../",
    root: "../../",
  };
  if (process.env.node_environment === "production") {
    projectSettings = require("../appsettings.deployment.json");
  } else {
    projectSettings = require("../appsettings.development.json");
  }

  return path.join(__dirname, "../", projectSettings.root);
};

const getRootDialog = (): string => {
  // Find entry dialog file
  let mainDialog = "main.dialog";
  const files = fs.readdirSync(getProjectRoot());
  for (let file of files) {
    if (file.endsWith(".dialog")) {
      mainDialog = file;
      break;
    }
  }
  return mainDialog;
};

const Configure = () => {
  // Create resource explorer.
  const resourceExplorer = new ResourceExplorer().addFolders(
    getProjectRoot(),
    ["runtime"],
    false
  );
  resourceExplorer.addComponent(
    new AdaptiveDialogComponentRegistration(resourceExplorer)
  );

  // Create adapter.
  // See https://aka.ms/about-bot-adapter to learn more about .bot file its use and bot configuration.
  const adapter = new BotFrameworkAdapter({
    appId: process.env.microsoftAppID,
    appPassword: process.env.microsoftAppPassword,
  });
  adapter.use(new LanguageGeneratorMiddleWare(resourceExplorer));

  // get settings

  const userState = new UserState(new MemoryStorage());
  const conversationState = new ConversationState(new MemoryStorage());
  const bot = new ComposerBot(
    userState,
    conversationState,
    getRootDialog(),
    getSettings()
  );

  return { adapter, bot };
};

const getSettings = () => {
  // Find settings json file
  let settings = {};
  const projectRoot = getProjectRoot();
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
        settings = Object.assign(settings, items); // merge settings
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

server.post("/api/messages", (req, res): void => {
  const { adapter, bot } = Configure();
  adapter.processActivity(
    req,
    res,
    async (context): Promise<any> => {
      // Route activity to bot.
      await bot.onTurn(context);
    }
  );
});
