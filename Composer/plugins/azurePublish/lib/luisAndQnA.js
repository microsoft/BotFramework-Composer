"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LuisAndQnaPublish = void 0;
const path = __importStar(require("path"));
const util_1 = require("util");
const fs = __importStar(require("fs-extra"));
const rp = __importStar(require("request-promise"));
const crossTrainUtil_1 = require("./utils/crossTrainUtil");
const botProjectLoggerType_1 = require("./botProjectLoggerType");
const crossTrainer = require('@microsoft/bf-lu/lib/parser/cross-train/crossTrainer.js');
const luBuild = require('@microsoft/bf-lu/lib/parser/lubuild/builder.js');
const qnaBuild = require('@microsoft/bf-lu/lib/parser/qnabuild/builder.js');
const readdir = util_1.promisify(fs.readdir);
const INTERUPTION = 'interuption';
class LuisAndQnaPublish {
    constructor(config) {
        this.logger = config.logger;
        // path to the ready to deploy generated folder
        this.remoteBotPath = path.join(config.projPath, 'ComposerDialogs');
        this.generatedFolder = path.join(this.remoteBotPath, 'generated');
        this.interruptionFolderPath = path.join(this.generatedFolder, INTERUPTION);
        // Cross Train config
        this.crossTrainConfig = {
            rootIds: [],
            triggerRules: {},
            intentName: '_Interruption',
            verbose: true,
            botName: '',
        };
    }
    /*******************************************************************************************************************************/
    /* This section has to do with publishing LU files to LUIS
    /*******************************************************************************************************************************/
    /**
     * return an array of all the files in a given directory
     * @param dir
     */
    getFiles(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            const dirents = yield readdir(dir, { withFileTypes: true });
            const files = yield Promise.all(dirents.map((dirent) => {
                const res = path.resolve(dir, dirent.name);
                return dirent.isDirectory() ? this.getFiles(res) : res;
            }));
            return Array.prototype.concat(...files);
        });
    }
    /**
     * Helper function to get the appropriate account out of a list of accounts
     * @param accounts
     * @param filter
     */
    getAccount(accounts, filter) {
        for (const account of accounts) {
            if (account.AccountName === filter) {
                return account;
            }
        }
    }
    notEmptyModel(file) {
        return fs.readFileSync(file).length > 0;
    }
    createGeneratedDir() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield fs.pathExists(this.generatedFolder))) {
                yield fs.mkdir(this.generatedFolder);
            }
        });
    }
    setCrossTrainConfig(botName, dialogFiles, luFiles) {
        return __awaiter(this, void 0, void 0, function* () {
            const dialogs = [];
            for (const dialog of dialogFiles) {
                dialogs.push({
                    id: dialog.substring(dialog.lastIndexOf('\\') + 1, dialog.length),
                    isRoot: dialog.indexOf(path.join(this.remoteBotPath, 'dialogs')) === -1,
                    content: fs.readJSONSync(dialog),
                });
            }
            const luFileInfos = luFiles.map((luFile) => {
                const fileStats = fs.statSync(luFile);
                return {
                    name: luFile.substring(luFile.lastIndexOf('\\') + 1),
                    content: fs.readFileSync(luFile, 'utf-8'),
                    lastModified: fileStats.mtime.toString(),
                    path: luFile,
                    relativePath: luFile.substring(luFile.lastIndexOf(this.remoteBotPath) + 1),
                };
            });
            this.crossTrainConfig = crossTrainUtil_1.createCrossTrainConfig(dialogs, luFileInfos);
        });
    }
    writeCrossTrainFiles(crossTrainResult) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield fs.pathExists(this.interruptionFolderPath))) {
                yield fs.mkdir(this.interruptionFolderPath);
            }
            yield Promise.all([...crossTrainResult.keys()].map((key) => __awaiter(this, void 0, void 0, function* () {
                const fileName = path.basename(key);
                const newFileId = path.join(this.interruptionFolderPath, fileName);
                yield fs.writeFile(newFileId, crossTrainResult.get(key).Content);
            })));
        });
    }
    crossTrain(luFiles, qnaFiles) {
        return __awaiter(this, void 0, void 0, function* () {
            const luContents = [];
            const qnaContents = [];
            for (const luFile of luFiles) {
                luContents.push({
                    content: fs.readFileSync(luFile, { encoding: 'utf-8' }),
                    id: luFile.substring(luFile.lastIndexOf('\\') + 1),
                });
            }
            for (const qnaFile of qnaFiles) {
                qnaContents.push({
                    content: fs.readFileSync(qnaFile, { encoding: 'utf-8' }),
                    id: qnaFile.substring(qnaFile.lastIndexOf('\\') + 1),
                });
            }
            const result = yield crossTrainer.crossTrain(luContents, qnaContents, this.crossTrainConfig);
            yield this.writeCrossTrainFiles(result.luResult);
            yield this.writeCrossTrainFiles(result.qnaResult);
        });
    }
    cleanCrossTrain() {
        return __awaiter(this, void 0, void 0, function* () {
            fs.rmdirSync(this.interruptionFolderPath, { recursive: true });
        });
    }
    getInterruptionFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            const files = yield this.getFiles(this.interruptionFolderPath);
            const interruptionLuFiles = [];
            const interruptionQnaFiles = [];
            files.forEach((file) => {
                if (file.endsWith('qna')) {
                    interruptionQnaFiles.push(file);
                }
                else if (file.endsWith('lu')) {
                    interruptionLuFiles.push(file);
                }
            });
            return { interruptionLuFiles, interruptionQnaFiles };
        });
    }
    publishLuis(name, environment, accessToken, language, luisSettings, interruptionLuFiles, luisResource) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const { authoringKey: luisAuthoringKey, endpoint: luisEndpoint } = luisSettings;
            this.logger({
                status: botProjectLoggerType_1.BotProjectDeployLoggerType.DEPLOY_INFO,
                message: 'start publish luis',
            });
            // Find any files that contain the name 'luis.settings' in them
            // These are generated by the LuBuild process and placed in the generated folder
            // These contain dialog-to-luis app id mapping
            const luisConfigFiles = (yield this.getFiles(this.remoteBotPath)).filter((filename) => filename.includes('luis.settings'));
            const luisAppIds = {};
            // Read in all the luis app id mappings
            for (const luisConfigFile of luisConfigFiles) {
                const luisSettings = yield fs.readJson(luisConfigFile);
                Object.assign(luisAppIds, luisSettings.luis);
            }
            // In order for the bot to use the LUIS models, we need to assign a LUIS key to the endpoint of each app
            // First step is to get a list of all the accounts available based on the given luisAuthoringKey.
            let accountList;
            try {
                // Make a call to the azureaccounts api
                // DOCS HERE: https://westus.dev.cognitive.microsoft.com/docs/services/5890b47c39e2bb17b84a55ff/operations/5be313cec181ae720aa2b26c
                // This returns a list of azure account information objects with AzureSubscriptionID, ResourceGroup, AccountName for each.
                const getAccountUri = `${luisEndpoint}/luis/api/v2.0/azureaccounts`;
                const options = {
                    headers: { Authorization: `Bearer ${accessToken}`, 'Ocp-Apim-Subscription-Key': luisAuthoringKey },
                };
                const response = yield rp.get(getAccountUri, options);
                // this should include an array of account info objects
                accountList = JSON.parse(response);
            }
            catch (err) {
                // handle the token invalid
                const error = JSON.parse(err.error);
                if (((_a = error === null || error === void 0 ? void 0 : error.error) === null || _a === void 0 ? void 0 : _a.message) && ((_b = error === null || error === void 0 ? void 0 : error.error) === null || _b === void 0 ? void 0 : _b.message.indexOf('access token expiry')) > 0) {
                    throw new Error(`Type: ${(_c = error === null || error === void 0 ? void 0 : error.error) === null || _c === void 0 ? void 0 : _c.code}, Message: ${(_d = error === null || error === void 0 ? void 0 : error.error) === null || _d === void 0 ? void 0 : _d.message}, run az account get-access-token, then replace the accessToken in your configuration`);
                }
                else {
                    throw err;
                }
            }
            // Extract the accoutn object that matches the expected resource name.
            // This is the name that would appear in the azure portal associated with the luis endpoint key.
            const account = this.getAccount(accountList, luisResource ? luisResource : `${name}-${environment}-luis`);
            // Assign the appropriate account to each of the applicable LUIS apps for this bot.
            // DOCS HERE: https://westus.dev.cognitive.microsoft.com/docs/services/5890b47c39e2bb17b84a55ff/operations/5be32228e8473de116325515
            for (const dialogKey in luisAppIds) {
                const luisAppId = luisAppIds[dialogKey];
                this.logger({
                    status: botProjectLoggerType_1.BotProjectDeployLoggerType.DEPLOY_INFO,
                    message: `Assigning to luis app id: ${luisAppId}`,
                });
                const luisAssignEndpoint = `${luisEndpoint}/luis/api/v2.0/apps/${luisAppId}/azureaccounts`;
                const options = {
                    body: account,
                    json: true,
                    headers: { Authorization: `Bearer ${accessToken}`, 'Ocp-Apim-Subscription-Key': luisAuthoringKey },
                };
                const response = yield rp.post(luisAssignEndpoint, options);
                // TODO: Add some error handling on this API call. As it is, errors will just throw by default and be caught by the catch all try/catch in the deploy method
                this.logger({
                    status: botProjectLoggerType_1.BotProjectDeployLoggerType.DEPLOY_INFO,
                    message: response,
                });
            }
            // The process has now completed.
            this.logger({
                status: botProjectLoggerType_1.BotProjectDeployLoggerType.DEPLOY_INFO,
                message: 'Luis Publish Success! ...',
            });
            // return the new settings that need to be added to the main settings file.
            return luisAppIds;
        });
    }
    // Run through the lubuild process
    // This happens in the build folder, NOT in the original source folder
    buildLuis(name, environment, language, luisSettings, interruptionLuFiles) {
        return __awaiter(this, void 0, void 0, function* () {
            const { authoringKey: luisAuthoringKey, authoringRegion: luisAuthoringRegion } = luisSettings;
            // Instantiate the LuBuild object from the LU parsing library
            // This object is responsible for parsing the LU files and sending them to LUIS
            const builder = new luBuild.Builder((msg) => this.logger({
                status: botProjectLoggerType_1.BotProjectDeployLoggerType.DEPLOY_INFO,
                message: msg,
            }));
            // Pass in the list of the non-empty LU files we got above...
            const loadResult = yield builder.loadContents(interruptionLuFiles, language || 'en-us', environment || '', luisAuthoringRegion || '');
            // set the default endpoint
            if (!luisSettings.endpoint) {
                luisSettings.endpoint = `https://${luisAuthoringRegion}.api.cognitive.microsoft.com`;
            }
            // if not specified, set the authoring endpoint
            if (!luisSettings.authoringEndpoint) {
                luisSettings.authoringEndpoint = luisSettings.endpoint;
            }
            // Perform the Lubuild process
            // This will create new luis apps for each of the luis models represented in the LU files
            const buildResult = yield builder.build(loadResult.luContents, loadResult.recognizers, luisAuthoringKey, luisSettings.authoringEndpoint, name, environment, language, true, false, loadResult.multiRecognizers, loadResult.settings, loadResult.crosstrainedRecognizers, 'crosstrained');
            // Write the generated files to the generated folder
            yield builder.writeDialogAssets(buildResult, true, this.generatedFolder);
            this.logger({
                status: botProjectLoggerType_1.BotProjectDeployLoggerType.DEPLOY_INFO,
                message: `lubuild succeed`,
            });
        });
    }
    buildQna(name, environment, language, qnaSettings, interruptionQnaFiles) {
        return __awaiter(this, void 0, void 0, function* () {
            // eslint-disable-next-line prefer-const
            let { subscriptionKey } = qnaSettings;
            const authoringRegion = 'westus';
            // publishing luis
            const builder = new qnaBuild.Builder((msg) => this.logger({
                status: botProjectLoggerType_1.BotProjectDeployLoggerType.DEPLOY_INFO,
                message: msg,
            }));
            const loadResult = yield builder.loadContents(interruptionQnaFiles, name, environment || '', authoringRegion || '', language || '');
            const endpoint = `https://${authoringRegion}.api.cognitive.microsoft.com/qnamaker/v4.0`;
            const buildResult = yield builder.build(loadResult.qnaContents, loadResult.recognizers, subscriptionKey, endpoint, name, environment, language, loadResult.multiRecognizers, loadResult.settings, loadResult.crosstrainedRecognizers, 'crosstrained');
            yield builder.writeDialogAssets(buildResult, true, this.generatedFolder);
            this.logger({
                status: botProjectLoggerType_1.BotProjectDeployLoggerType.DEPLOY_INFO,
                message: `qnabuild succeed`,
            });
            // Find any files that contain the name 'qnamaker.settings' in them
            // These are generated by the LuBuild process and placed in the generated folder
            // These contain dialog-to-luis app id mapping
            const qnaConfigFile = (yield this.getFiles(this.remoteBotPath)).find((filename) => filename.includes('qnamaker.settings'));
            const qna = {};
            // Read the qna settings
            if (qnaConfigFile) {
                const qnaConfig = yield fs.readJson(qnaConfigFile);
                const endpointKey = yield builder.getEndpointKeys(subscriptionKey, endpoint);
                Object.assign(qna, qnaConfig.qna, { endpointKey: endpointKey.primaryEndpointKey });
            }
            return qna;
        });
    }
    // Run through the build process
    // This happens in the build folder, NOT in the original source folder
    publishLuisAndQna(name, environment, accessToken, language, luisSettings, qnaSettings, luisResource) {
        return __awaiter(this, void 0, void 0, function* () {
            const { authoringKey, authoringRegion } = luisSettings;
            const { subscriptionKey } = qnaSettings;
            const botFiles = yield this.getFiles(this.remoteBotPath);
            const luFiles = botFiles.filter((name) => {
                return name.endsWith('.lu');
            });
            const qnaFiles = botFiles.filter((name) => {
                return name.endsWith('.qna');
            });
            // check content
            const notEmptyLuFiles = luFiles.some((name) => this.notEmptyModel(name));
            const notEmptyQnaFiles = qnaFiles.some((name) => this.notEmptyModel(name));
            if (notEmptyLuFiles && !(authoringKey && authoringRegion)) {
                throw Error('Should have luis authoringKey and authoringRegion when lu file not empty');
            }
            if (notEmptyQnaFiles && !subscriptionKey) {
                throw Error('Should have qna subscriptionKey when qna file not empty');
            }
            const dialogFiles = botFiles.filter((name) => {
                return name.endsWith('.dialog') && this.notEmptyModel(name);
            });
            yield this.setCrossTrainConfig(name, dialogFiles, luFiles);
            yield this.createGeneratedDir();
            yield this.crossTrain(luFiles, qnaFiles);
            const { interruptionLuFiles, interruptionQnaFiles } = yield this.getInterruptionFiles();
            yield this.buildLuis(name, environment, language, luisSettings, interruptionLuFiles);
            let luisAppIds = {};
            // publish luis only when Lu files not empty
            if (notEmptyLuFiles) {
                luisAppIds = yield this.publishLuis(name, environment, accessToken, language, luisSettings, interruptionLuFiles, luisResource);
            }
            const qnaConfig = yield this.buildQna(name, environment, language, qnaSettings, interruptionQnaFiles);
            yield this.cleanCrossTrain();
            return { luisAppIds, qnaConfig };
        });
    }
}
exports.LuisAndQnaPublish = LuisAndQnaPublish;
//# sourceMappingURL=luisAndQnA.js.map