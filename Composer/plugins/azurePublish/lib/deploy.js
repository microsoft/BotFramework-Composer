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
exports.BotProjectDeploy = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const rp = __importStar(require("request-promise"));
const botProjectLoggerType_1 = require("./botProjectLoggerType");
const luisAndQnA_1 = require("./luisAndQnA");
const archiver = require("archiver");
class BotProjectDeploy {
    constructor(config) {
        var _a;
        this.logger = config.logger;
        this.accessToken = config.accessToken;
        this.projPath = config.projPath;
        // get the appropriate runtime
        this.runtime = config.runtime;
        // path to the zipped assets
        this.zipPath = (_a = config.zipPath) !== null && _a !== void 0 ? _a : path.join(this.projPath, 'code.zip');
    }
    /*******************************************************************************************************************************/
    /* This section has to do with deploying to existing Azure resources
    /*******************************************************************************************************************************/
    /**
     * Deploy a bot to a location
     */
    deploy(project, settings, profileName, name, environment, hostname, luisResource) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // STEP 1: CLEAN UP PREVIOUS BUILDS
                // cleanup any previous build
                if (yield fs.pathExists(this.zipPath)) {
                    yield fs.remove(this.zipPath);
                }
                // STEP 2: UPDATE LUIS
                // Do the LUIS build if LUIS settings are present
                let language = settings.defaultLanguage || settings.luis.defaultLanguage;
                if (!language) {
                    language = 'en-us';
                }
                const publisher = new luisAndQnA_1.LuisAndQnaPublish({ logger: this.logger, projPath: this.projPath });
                // this function returns an object that contains the luis APP ids mapping
                // each dialog to its matching app.
                const { luisAppIds, qnaConfig } = yield publisher.publishLuisAndQna(name, environment, this.accessToken, language, settings.luis, settings.qna, luisResource);
                // amend luis settings with newly generated values
                settings.luis = Object.assign(Object.assign({}, settings.luis), luisAppIds);
                settings.qna = Object.assign(Object.assign({}, settings.qna), qnaConfig);
                // STEP 3: BUILD
                // run any platform specific build steps.
                // this returns a pathToArtifacts where the deployable version lives.
                const pathToArtifacts = yield this.runtime.buildDeploy(this.projPath, project, settings, profileName);
                // STEP 4: ZIP THE ASSETS
                // Build a zip file of the project
                this.logger({
                    status: botProjectLoggerType_1.BotProjectDeployLoggerType.DEPLOY_INFO,
                    message: 'Packing up the bot service ...',
                });
                yield this.zipDirectory(pathToArtifacts, this.zipPath);
                this.logger({
                    status: botProjectLoggerType_1.BotProjectDeployLoggerType.DEPLOY_INFO,
                    message: 'Packing Service Success!',
                });
                // STEP 5: DEPLOY THE ZIP FILE TO AZURE
                // Deploy the zip file to the web app
                this.logger({
                    status: botProjectLoggerType_1.BotProjectDeployLoggerType.DEPLOY_INFO,
                    message: 'Publishing to Azure ...',
                });
                yield this.deployZip(this.accessToken, this.zipPath, name, environment, hostname);
                this.logger({
                    status: botProjectLoggerType_1.BotProjectDeployLoggerType.DEPLOY_SUCCESS,
                    message: 'Publish To Azure Success!',
                });
            }
            catch (error) {
                this.logger({
                    status: botProjectLoggerType_1.BotProjectDeployLoggerType.DEPLOY_ERROR,
                    message: JSON.stringify(error, Object.getOwnPropertyNames(error)),
                });
                throw error;
            }
        });
    }
    zipDirectory(source, out) {
        return __awaiter(this, void 0, void 0, function* () {
            const archive = archiver('zip', { zlib: { level: 9 } });
            const stream = fs.createWriteStream(out);
            return new Promise((resolve, reject) => {
                archive
                    .glob('**/*', {
                    cwd: source,
                    dot: true,
                    ignore: ['**/code.zip', 'node_modules/**/*'],
                })
                    .on('error', (err) => reject(err))
                    .pipe(stream);
                stream.on('close', () => resolve());
                archive.finalize();
            });
        });
    }
    // Upload the zip file to Azure
    // DOCS HERE: https://docs.microsoft.com/en-us/azure/app-service/deploy-zip
    deployZip(token, zipPath, name, env, hostname) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger({
                status: botProjectLoggerType_1.BotProjectDeployLoggerType.DEPLOY_INFO,
                message: 'Retrieve publishing details ...',
            });
            const publishEndpoint = `https://${hostname ? hostname : name + '-' + env}.scm.azurewebsites.net/zipdeploy/?isAsync=true`;
            try {
                const response = yield rp.post({
                    uri: publishEndpoint,
                    auth: {
                        bearer: token,
                    },
                    body: fs.createReadStream(zipPath),
                });
                this.logger({
                    status: botProjectLoggerType_1.BotProjectDeployLoggerType.DEPLOY_INFO,
                    message: response,
                });
            }
            catch (err) {
                if (err.statusCode === 403) {
                    throw new Error(`Token expired, please run az account get-access-token, then replace the accessToken in your configuration`);
                }
                else {
                    throw err;
                }
            }
        });
    }
}
exports.BotProjectDeploy = BotProjectDeploy;
//# sourceMappingURL=deploy.js.map