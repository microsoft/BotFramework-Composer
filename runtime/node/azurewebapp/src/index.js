"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var restify = require("restify");
var fs = require("fs");
var path = require("path");
var botbuilder_1 = require("botbuilder");
var botbuilder_dialogs_adaptive_1 = require("botbuilder-dialogs-adaptive");
var botbuilder_dialogs_declarative_1 = require("botbuilder-dialogs-declarative");
var index_1 = require("../../core/src/index");
// Create HTTP server.
var server = restify.createServer();
var argv = require("minimist")(process.argv.slice(2));
var port = process.env.port || process.env.PORT || argv.port || 3978;
server.listen(port, function () {
    console.log("\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator");
    console.log("\nTo talk to your bot, open http://localhost:" + port + "/api/messages in the Emulator.");
});
var getProjectRoot = function () {
    // Load project settings
    var projectSettings = {
        bot: "../../",
        root: "../../"
    };
    if (process.env.node_environment === "production") {
        projectSettings = require("../appsettings.deployment.json");
    }
    else {
        projectSettings = require("../appsettings.development.json");
    }
    return path.join(__dirname, "../", projectSettings.root);
};
var getRootDialog = function () {
    // Find entry dialog file
    var mainDialog = "main.dialog";
    var files = fs.readdirSync(getProjectRoot());
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        if (file.endsWith(".dialog")) {
            mainDialog = file;
            break;
        }
    }
    return mainDialog;
};
var Configure = function () {
    // Create resource explorer.
    var resourceExplorer = new botbuilder_dialogs_declarative_1.ResourceExplorer().addFolders(getProjectRoot(), ["runtime"], false);
    resourceExplorer.addComponent(new botbuilder_dialogs_adaptive_1.AdaptiveDialogComponentRegistration(resourceExplorer));
    // Create adapter.
    // See https://aka.ms/about-bot-adapter to learn more about .bot file its use and bot configuration.
    var adapter = new botbuilder_1.BotFrameworkAdapter({
        appId: process.env.microsoftAppID,
        appPassword: process.env.microsoftAppPassword
    });
    adapter.use(new botbuilder_dialogs_adaptive_1.LanguageGeneratorMiddleWare(resourceExplorer));
    // get settings
    var userState = new botbuilder_1.UserState(new botbuilder_1.MemoryStorage());
    var conversationState = new botbuilder_1.ConversationState(new botbuilder_1.MemoryStorage());
    var bot = new index_1.ComposerBot(userState, conversationState, getRootDialog(), getSettings());
    return { adapter: adapter, bot: bot };
};
var getSettings = function () {
    // Find settings json file
    var settings = {};
    var projectRoot = getProjectRoot();
    // load appsettings.json
    var appsettingsPath = path.join(projectRoot, "settings/appsettings.json");
    if (fs.existsSync(appsettingsPath)) {
        var items = require(appsettingsPath);
        settings = Object.assign(settings, items); // merge settings
    }
    // load generated settings
    var generatedPath = path.join(projectRoot, "generated");
    if (fs.existsSync(generatedPath)) {
        var generatedFiles = fs.readdirSync(generatedPath);
        for (var _i = 0, generatedFiles_1 = generatedFiles; _i < generatedFiles_1.length; _i++) {
            var file = generatedFiles_1[_i];
            if (file.endsWith(".json")) {
                var items = require(path.join(generatedPath, file));
                settings = Object.assign(settings, items); // merge settings
            }
        }
    }
    // load settings from arguments
    for (var key in argv) {
        if (key.indexOf(":") >= 0) {
            var segments = key.split(":");
            var base = settings;
            for (var i = 0; i < segments.length - 1; i++) {
                var segment = segments[i];
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
server.post("/api/messages", function (req, res) {
    var _a = Configure(), adapter = _a.adapter, bot = _a.bot;
    adapter.processActivity(req, res, function (context) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Route activity to bot.
                return [4 /*yield*/, bot.onTurn(context)];
                case 1:
                    // Route activity to bot.
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
