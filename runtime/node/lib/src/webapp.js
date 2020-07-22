"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettings = exports.Configure = exports.getRootDialog = exports.getProjectRoot = void 0;
const restify = require("restify");
const fs = require("fs");
const path = require("path");
const botbuilder_1 = require("botbuilder");
const botbuilder_dialogs_adaptive_1 = require("botbuilder-dialogs-adaptive");
const botbuilder_dialogs_declarative_1 = require("botbuilder-dialogs-declarative");
const composerBot_1 = require("./shared/composerBot");
// Create HTTP server.
const server = restify.createServer();
const argv = require("minimist")(process.argv.slice(2));
// prefer the argv port --port=XXXX over process.env because the parent Composer app uses that.
const port = argv.port || process.env.port || process.env.PORT || 3979;
exports.getProjectRoot = () => {
    // Load project settings
    let projectSettings = {
        bot: "../../",
        root: "../../",
    };
    if (process.env.node_environment === "production") {
        projectSettings = require("../appsettings.deployment.json");
    }
    else {
        projectSettings = require("../appsettings.development.json");
    }
    return path.join(__dirname, projectSettings.root);
};
exports.getRootDialog = (projRoot) => {
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
exports.Configure = (projRoot) => {
    // Create resource explorer.
    const resourceExplorer = new botbuilder_dialogs_declarative_1.ResourceExplorer().addFolders(projRoot, ["runtime"], false);
    resourceExplorer.addComponent(new botbuilder_dialogs_adaptive_1.AdaptiveDialogComponentRegistration(resourceExplorer));
    const settings = exports.getSettings(projRoot);
    // Create adapter.
    // See https://aka.ms/about-bot-adapter to learn more about .bot file its use and bot configuration.
    const adapter = new botbuilder_1.BotFrameworkAdapter({
        appId: process.env.microsoftAppID || settings.MicrosoftAppId,
        appPassword: process.env.microsoftAppPassword || settings.MicrosoftAppPassword,
    });
    adapter.use(new botbuilder_dialogs_adaptive_1.LanguageGeneratorMiddleWare(resourceExplorer));
    // get settings
    const bot = new composerBot_1.ComposerBot(resourceExplorer, exports.getRootDialog(projRoot), settings);
    return { adapter, bot };
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
    return settings;
};
const projectRoot = exports.getProjectRoot();
const { adapter, bot } = exports.Configure(projectRoot);
server.listen(port, () => {
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
    console.log(`\nTo talk to your bot, open http://localhost:${port}/api/messages in the Emulator.`);
});
server.post("/api/messages", (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Route activity to bot.
        await bot.onTurn(context);
    });
});
//# sourceMappingURL=webapp.js.map