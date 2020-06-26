"use strict";
// Copyright (c) Microsoft Corporation.
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const md5_1 = __importDefault(require("md5"));
const fs_extra_1 = require("fs-extra");
const deploy_1 = require("./deploy");
const schema_1 = __importDefault(require("./schema"));
// This option controls whether the history is serialized to a file between sessions with Composer
// set to TRUE for history to be saved to disk
// set to FALSE for history to be cached in memory only
const PERSIST_HISTORY = false;
const instructions = `To create a publish configuration, follow the instructions in the README file in your bot project folder.`;
// Wrap the entire class definition in the export so the composer object can be available to it
exports.default = (composer) => __awaiter(void 0, void 0, void 0, function* () {
    class AzurePublisher {
        constructor(mode) {
            this.baseRuntimeFolder = process.env.AZURE_PUBLISH_PATH || path_1.default.resolve(__dirname, `../publishBots`);
            /*******************************************************************************************************************************/
            /* These methods generate all the necessary paths to various files  */
            /*******************************************************************************************************************************/
            // path to working folder containing all the assets
            this.getRuntimeFolder = (key) => {
                return path_1.default.resolve(this.baseRuntimeFolder, `${key}`);
            };
            // path to the runtime code inside the working folder
            this.getProjectFolder = (key, template) => {
                return path_1.default.resolve(this.baseRuntimeFolder, `${key}/${template}`);
            };
            // path to the declarative assets
            this.getBotFolder = (key, template) => path_1.default.resolve(this.getProjectFolder(key, template), 'ComposerDialogs');
            // path to the root settings file
            this.getSettingsPath = (key, template) => path_1.default.resolve(this.getBotFolder(key, template), 'settings/appsettings.json');
            // path where manifest files will be written
            this.getManifestDstDir = (key, template) => path_1.default.resolve(this.getProjectFolder(key, template), 'wwwroot');
            this.getHistory = (botId, profileName) => __awaiter(this, void 0, void 0, function* () {
                if (this.histories && this.histories[botId] && this.histories[botId][profileName]) {
                    return this.histories[botId][profileName];
                }
                return [];
            });
            this.updateHistory = (botId, profileName, newHistory) => __awaiter(this, void 0, void 0, function* () {
                if (!this.histories[botId]) {
                    this.histories[botId] = {};
                }
                if (!this.histories[botId][profileName]) {
                    this.histories[botId][profileName] = [];
                }
                this.histories[botId][profileName].unshift(newHistory);
                if (PERSIST_HISTORY) {
                    yield fs_extra_1.writeJson(this.historyFilePath, this.histories);
                }
            });
            /*******************************************************************************************************************************/
            /* These methods implement the publish actions */
            /*******************************************************************************************************************************/
            /**
             * Prepare a bot to be built and deployed by copying the runtime and declarative assets into a temporary folder
             * @param botFiles
             * @param settings
             * @param srcTemplate
             * @param resourcekey
             */
            this.init = (botFiles, settings, srcTemplate, resourcekey) => __awaiter(this, void 0, void 0, function* () {
                const botFolder = this.getBotFolder(resourcekey, this.mode);
                const runtimeFolder = this.getRuntimeFolder(resourcekey);
                const settingsPath = this.getSettingsPath(resourcekey, this.mode);
                const manifestPath = this.getManifestDstDir(resourcekey, this.mode);
                // clean up from any previous deploys
                yield this.cleanup(resourcekey);
                // create the temporary folder to contain this project
                fs_extra_1.mkdirSync(runtimeFolder, { recursive: true });
                // create the ComposerDialogs/ folder
                fs_extra_1.mkdirSync(botFolder, { recursive: true });
                // save bot files and manifest files into wwwroot/
                for (const file of botFiles) {
                    const pattern = /manifests\/[0-9A-z-]*.json/;
                    let filePath;
                    if (file.relativePath.match(pattern)) {
                        // save manifest files into wwwroot
                        filePath = path_1.default.resolve(manifestPath, file.relativePath);
                    }
                    else {
                        // save bot files
                        filePath = path_1.default.resolve(botFolder, file.relativePath);
                    }
                    if (!(yield fs_extra_1.pathExists(path_1.default.dirname(filePath)))) {
                        fs_extra_1.mkdirSync(path_1.default.dirname(filePath), { recursive: true });
                    }
                    fs_extra_1.writeFileSync(filePath, file.content);
                }
                // Saves the bot's *root settings* to the appsettings.json file
                // These are the settings found in the bot's Settings tab in composer.
                // TODO: this should be handled by plugin - WRITE TO appsettings.json
                if (!(yield fs_extra_1.pathExists(path_1.default.dirname(settingsPath)))) {
                    fs_extra_1.mkdirSync(path_1.default.dirname(settingsPath), { recursive: true });
                }
                yield fs_extra_1.writeJson(settingsPath, settings, { spaces: 4 });
                // copy bot and runtime into projFolder
                yield fs_extra_1.copy(srcTemplate, runtimeFolder);
            });
            /**
             * Take the project from a given folder, build it, and push it to Azure.
             * @param project
             * @param runtime
             * @param botId
             * @param profileName
             * @param jobId
             * @param resourcekey
             * @param customizeConfiguration
             */
            this.performDeploymentAction = (project, runtime, botId, profileName, jobId, resourcekey, customizeConfiguration) => __awaiter(this, void 0, void 0, function* () {
                const { subscriptionID, accessToken, name, environment, hostname, luisResource, language, } = customizeConfiguration;
                try {
                    // Create the BotProjectDeploy object, which is used to carry out the deploy action.
                    const azDeployer = new deploy_1.BotProjectDeploy({
                        subId: subscriptionID,
                        logger: (msg) => {
                            console.log(msg);
                            this.logMessages.push(JSON.stringify(msg, null, 2));
                            // update the log messages provided to Composer via the status API.
                            const status = this.getLoadingStatus(botId, profileName, jobId);
                            status.result.log = this.logMessages.join('\n');
                            this.updateHistory(botId, profileName, Object.assign({ status: status.status }, status.result));
                        },
                        accessToken: accessToken,
                        projPath: this.getProjectFolder(resourcekey, this.mode),
                        runtime: runtime,
                    });
                    // Perform the deploy
                    yield azDeployer.deploy(project, profileName, name, environment, language, hostname, luisResource);
                    // update status and history
                    const status = this.getLoadingStatus(botId, profileName, jobId);
                    if (status) {
                        status.status = 200;
                        status.result.message = 'Success';
                        status.result.log = this.logMessages.join('\n');
                        yield this.updateHistory(botId, profileName, Object.assign({ status: status.status }, status.result));
                        this.removeLoadingStatus(botId, profileName, jobId);
                        // await this.cleanup(resourcekey);
                    }
                }
                catch (error) {
                    console.log(error);
                    if (error instanceof Error) {
                        this.logMessages.push(error.message);
                    }
                    else if (typeof error === 'object') {
                        this.logMessages.push(JSON.stringify(error));
                    }
                    else {
                        this.logMessages.push(error);
                    }
                    // update status and history
                    const status = this.getLoadingStatus(botId, profileName, jobId);
                    if (status) {
                        status.status = 500;
                        status.result.message = this.logMessages[this.logMessages.length - 1];
                        status.result.log = this.logMessages.join('\n');
                        yield this.updateHistory(botId, profileName, Object.assign({ status: status.status }, status.result));
                        this.removeLoadingStatus(botId, profileName, jobId);
                        // await this.cleanup(resourcekey);
                    }
                }
            });
            /*******************************************************************************************************************************/
            /* These methods help to track the process of the deploy and provide info to Composer */
            /*******************************************************************************************************************************/
            this.addLoadingStatus = (botId, profileName, newStatus) => {
                // save in publishingBots
                if (!this.publishingBots[botId]) {
                    this.publishingBots[botId] = {};
                }
                if (!this.publishingBots[botId][profileName]) {
                    this.publishingBots[botId][profileName] = [];
                }
                this.publishingBots[botId][profileName].push(newStatus);
            };
            this.removeLoadingStatus = (botId, profileName, jobId) => {
                if (this.publishingBots[botId] && this.publishingBots[botId][profileName]) {
                    const index = this.publishingBots[botId][profileName].findIndex((item) => item.result.id === jobId);
                    const status = this.publishingBots[botId][profileName][index];
                    this.publishingBots[botId][profileName] = this.publishingBots[botId][profileName]
                        .slice(0, index)
                        .concat(this.publishingBots[botId][profileName].slice(index + 1));
                    return status;
                }
                return;
            };
            this.getLoadingStatus = (botId, profileName, jobId = '') => {
                if (this.publishingBots[botId] && this.publishingBots[botId][profileName].length > 0) {
                    // get current status
                    if (jobId) {
                        return this.publishingBots[botId][profileName].find((item) => item.result.id === jobId);
                    }
                    return this.publishingBots[botId][profileName][this.publishingBots[botId][profileName].length - 1];
                }
                return undefined;
            };
            /**************************************************************************************************
             * plugin methods
             *************************************************************************************************/
            this.publish = (config, project, metadata, user) => __awaiter(this, void 0, void 0, function* () {
                const { 
                // these are provided by Composer
                fullSettings, // all the bot's settings - includes sensitive values not included in projet.settings
                templatePath, // templatePath point to the dotnet code todo: SHOULD BE DEPRECATED in favor of pulling this from the runtime template
                profileName, // the name of the publishing profile "My Azure Prod Slot"
                // these are specific to the azure publish profile shape
                subscriptionID, name, environment, hostname, luisResource, language, settings, accessToken, } = config;
                // point to the declarative assets (possibly in remote storage)
                const botFiles = project.files;
                // get the bot id from the project
                const botId = project.id;
                // generate an id to track this deploy
                const jobId = uuid_1.v4();
                // get the appropriate runtime template which contains methods to build and configure the runtime
                const runtime = composer.getRuntimeByProject(project);
                // resource key to map to one provision resource
                const resourcekey = md5_1.default([project.name, name, environment, settings === null || settings === void 0 ? void 0 : settings.MicrosoftAppPassword].join());
                // If the project is using an "ejected" runtime, use that version of the code instead of the built-in template
                // TODO: this templatePath should come from the runtime instead of this magic parameter
                let runtimeCodePath = templatePath;
                if (project.settings &&
                    project.settings.runtime &&
                    project.settings.runtime.customRuntime === true &&
                    project.settings.runtime.path) {
                    runtimeCodePath = project.settings.runtime.path;
                }
                // Initialize the output logs...
                this.logMessages = ['Publish starting...'];
                // Add first "in process" log message
                const response = {
                    status: 202,
                    result: {
                        id: jobId,
                        time: new Date(),
                        message: 'Accepted for publishing.',
                        log: this.logMessages.join('\n'),
                        comment: metadata.comment,
                    },
                };
                this.addLoadingStatus(botId, profileName, response);
                try {
                    // test creds, if not valid, return 500
                    if (!accessToken) {
                        throw new Error('Required field `accessToken` is missing from publishing profile.');
                    }
                    if (!settings) {
                        throw new Error('Required field `settings` is missing from publishing profile.');
                    }
                    // Prepare the temporary project
                    yield this.init(botFiles, fullSettings, runtimeCodePath, resourcekey);
                    // TODO: here is where we configure the template for the runtime, and should be parameterized when we
                    // implement interchangeable runtimes
                    // Append the settings found in the publishing profile to the appsettings.deployment.json file
                    // TODO: this should be in the runtime plugin - write to appsettings.deployment.json
                    const resourcePath = path_1.default.resolve(this.getProjectFolder(resourcekey, this.mode), 'appsettings.deployment.json');
                    const appSettings = yield fs_extra_1.readJson(resourcePath);
                    yield fs_extra_1.writeJson(resourcePath, Object.assign(Object.assign({}, appSettings), settings), {
                        spaces: 4,
                    });
                    // Prepare parameters and then perform the actual deployment action
                    const customizeConfiguration = {
                        accessToken,
                        subscriptionID,
                        name,
                        environment,
                        hostname,
                        luisResource,
                        language,
                    };
                    this.performDeploymentAction(project, runtime, botId, profileName, jobId, resourcekey, customizeConfiguration);
                }
                catch (err) {
                    console.log(err);
                    if (err instanceof Error) {
                        this.logMessages.push(err.message);
                    }
                    else if (typeof err === 'object') {
                        this.logMessages.push(JSON.stringify(err));
                    }
                    else {
                        this.logMessages.push(err);
                    }
                    response.status = 500;
                    response.result.message = this.logMessages[this.logMessages.length - 1];
                    this.updateHistory(botId, profileName, Object.assign({ status: response.status }, response.result));
                    // this.cleanup(resourcekey);
                }
                return response;
            });
            this.getStatus = (config, project, user) => __awaiter(this, void 0, void 0, function* () {
                const profileName = config.profileName;
                const botId = project.id;
                // return latest status
                const status = this.getLoadingStatus(botId, profileName);
                if (status) {
                    return status;
                }
                else {
                    const current = yield this.getHistory(botId, profileName);
                    if (current.length > 0) {
                        return { status: current[0].status, result: Object.assign({}, current[0]) };
                    }
                    return {
                        status: 404,
                        result: {
                            message: 'bot not published',
                        },
                    };
                }
            });
            this.history = (config, project, user) => __awaiter(this, void 0, void 0, function* () {
                const profileName = config.profileName;
                const botId = project.id;
                return yield this.getHistory(botId, profileName);
            });
            this.histories = {};
            this.historyFilePath = path_1.default.resolve(__dirname, '../publishHistory.txt');
            if (PERSIST_HISTORY) {
                this.loadHistoryFromFile();
            }
            this.publishingBots = {};
            this.logMessages = [];
            this.mode = mode || 'azurewebapp';
        }
        /*******************************************************************************************************************************/
        /* These methods deal with the publishing history displayed in the Composer UI */
        /*******************************************************************************************************************************/
        loadHistoryFromFile() {
            return __awaiter(this, void 0, void 0, function* () {
                if (yield fs_extra_1.pathExists(this.historyFilePath)) {
                    this.histories = yield fs_extra_1.readJson(this.historyFilePath);
                }
            });
        }
        /**
         * Remove any previous version of a project's working files
         * @param resourcekey
         */
        cleanup(resourcekey) {
            return __awaiter(this, void 0, void 0, function* () {
                const projFolder = this.getRuntimeFolder(resourcekey);
                yield fs_extra_1.emptyDir(projFolder);
                yield fs_extra_1.rmdir(projFolder);
            });
        }
    }
    const azurePublish = new AzurePublisher();
    const azureFunctionsPublish = new AzurePublisher('azurefunctions');
    yield composer.addPublishMethod(azurePublish, schema_1.default, instructions);
    yield composer.addPublishMethod(azureFunctionsPublish, schema_1.default, instructions, 'plugin-azure-functions-publish', 'Publish bot to Azure Functions (Preview)');
});
//# sourceMappingURL=index.js.map