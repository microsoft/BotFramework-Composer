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
exports.LuisPublish = void 0;
const path = __importStar(require("path"));
const util_1 = require("util");
const fs = __importStar(require("fs-extra"));
const rp = __importStar(require("request-promise"));
const botProjectLoggerType_1 = require("./botProjectLoggerType");
const luBuild = require('@microsoft/bf-lu/lib/parser/lubuild/builder.js');
const readdir = util_1.promisify(fs.readdir);
class LuisPublish {
    constructor(config) {
        this.logger = config.logger;
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
    notEmptyLuisModel(file) {
        return fs.readFileSync(file).length > 0;
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
    // Run through the lubuild process
    // This happens in the build folder, NOT in the original source folder
    publishLuis(workingFolder, name, environment, accessToken, language, luisSettings, luisResource) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const { authoringKey: luisAuthoringKey, authoringRegion: luisAuthoringRegion } = luisSettings;
            let { endpoint: luisEndpoint, authoringEndpoint: luisAuthoringEndpoint } = luisSettings;
            if (luisAuthoringKey && luisAuthoringRegion) {
                // Get a list of all the .lu files that are not empty
                const botFiles = yield this.getFiles(workingFolder);
                const modelFiles = botFiles.filter((name) => {
                    return name.endsWith('.lu') && this.notEmptyLuisModel(name);
                });
                // Identify the generated folder
                const generatedFolder = path.join(workingFolder, 'ComposerDialogs/generated');
                // Identify the deployment settings file
                // const deploymentSettingsPath = path.join(workingFolder, 'appsettings.deployment.json');
                // Ensure the generated folder exists
                if (!(yield fs.pathExists(generatedFolder))) {
                    yield fs.mkdir(generatedFolder);
                }
                // Instantiate the LuBuild object from the LU parsing library
                // This object is responsible for parsing the LU files and sending them to LUIS
                const builder = new luBuild.Builder((msg) => this.logger({
                    status: botProjectLoggerType_1.BotProjectDeployLoggerType.DEPLOY_INFO,
                    message: msg,
                }));
                // Pass in the list of the non-empty LU files we got above...
                const loadResult = yield builder.loadContents(modelFiles, language || 'en-us', environment || '', luisAuthoringRegion || '');
                // set the default endpoint
                if (!luisEndpoint) {
                    luisEndpoint = `https://${luisAuthoringRegion}.api.cognitive.microsoft.com`;
                }
                // if not specified, set the authoring endpoint
                if (!luisAuthoringEndpoint) {
                    luisAuthoringEndpoint = luisEndpoint;
                }
                // Perform the Lubuild process
                // This will create new luis apps for each of the luis models represented in the LU files
                const buildResult = yield builder.build(loadResult.luContents, loadResult.recognizers, luisAuthoringKey, luisAuthoringEndpoint, name, environment, language, true, false, loadResult.multiRecognizers, loadResult.settings);
                // Write the generated files to the generated folder
                yield builder.writeDialogAssets(buildResult, true, generatedFolder);
                this.logger({
                    status: botProjectLoggerType_1.BotProjectDeployLoggerType.DEPLOY_INFO,
                    message: `lubuild succeed`,
                });
                // Find any files that contain the name 'luis.settings' in them
                // These are generated by the LuBuild process and placed in the generated folder
                // These contain dialog-to-luis app id mapping
                const luisConfigFiles = (yield this.getFiles(workingFolder)).filter((filename) => filename.includes('luis.settings'));
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
            }
        });
    }
}
exports.LuisPublish = LuisPublish;
//# sourceMappingURL=luis.js.map