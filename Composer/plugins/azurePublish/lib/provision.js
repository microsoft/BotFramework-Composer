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
exports.BotProjectProvision = void 0;
const path = __importStar(require("path"));
const arm_resources_1 = require("@azure/arm-resources");
const arm_appinsights_1 = require("@azure/arm-appinsights");
const arm_botservice_1 = require("@azure/arm-botservice");
const graph_1 = require("@azure/graph");
const ms_rest_nodeauth_1 = require("@azure/ms-rest-nodeauth");
const fs = __importStar(require("fs-extra"));
const rp = __importStar(require("request-promise"));
const botProjectLoggerType_1 = require("./botProjectLoggerType");
class BotProjectProvision {
    constructor(config) {
        var _a;
        // Will be assigned by create or deploy
        this.tenantId = '';
        this.subId = config.subId;
        this.logger = config.logger;
        this.accessToken = config.accessToken;
        this.creds = config.creds;
        this.projPath = config.projPath;
        // path to the ARM template
        // this is currently expected to live in the code project
        this.templatePath = (_a = config.templatePath) !== null && _a !== void 0 ? _a : path.join(this.projPath, 'DeploymentTemplates', 'template-with-preexisting-rg.json');
    }
    /*******************************************************************************************************************************/
    /* This section has to do with creating new Azure resources
    /*******************************************************************************************************************************/
    /**
     * Write updated settings back to the settings file
     */
    updateDeploymentJsonFile(client, resourceGroupName, deployName, appId, appPwd) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const outputs = yield client.deployments.get(resourceGroupName, deployName);
            if ((_a = outputs === null || outputs === void 0 ? void 0 : outputs.properties) === null || _a === void 0 ? void 0 : _a.outputs) {
                const outputResult = outputs.properties.outputs;
                const applicationResult = {
                    MicrosoftAppId: appId,
                    MicrosoftAppPassword: appPwd,
                };
                const outputObj = this.unpackObject(outputResult);
                const result = {};
                Object.assign(result, outputObj, applicationResult);
                return result;
            }
            else {
                return null;
            }
        });
    }
    getErrorMesssage(err) {
        if (err.body) {
            if (err.body.error) {
                if (err.body.error.details) {
                    const details = err.body.error.details;
                    let errMsg = '';
                    for (const detail of details) {
                        errMsg += detail.message;
                    }
                    return errMsg;
                }
                else {
                    return err.body.error.message;
                }
            }
            else {
                return JSON.stringify(err.body, null, 2);
            }
        }
        else {
            return JSON.stringify(err, null, 2);
        }
    }
    pack(scope) {
        return {
            value: scope,
        };
    }
    unpackObject(output) {
        const unpacked = {};
        for (const key in output) {
            const objValue = output[key];
            if (objValue.value) {
                unpacked[key] = objValue.value;
            }
        }
        return unpacked;
    }
    /**
     * Format the parameters
     */
    getDeploymentTemplateParam(appId, appPwd, location, name, shouldCreateAuthoringResource, shouldCreateLuisResource, useAppInsights, useCosmosDb, useStorage) {
        return {
            appId: this.pack(appId),
            appSecret: this.pack(appPwd),
            appServicePlanLocation: this.pack(location),
            botId: this.pack(name),
            shouldCreateAuthoringResource: this.pack(shouldCreateAuthoringResource),
            shouldCreateLuisResource: this.pack(shouldCreateLuisResource),
            useAppInsights: this.pack(useAppInsights),
            useCosmosDb: this.pack(useCosmosDb),
            useStorage: this.pack(useStorage),
        };
    }
    readTemplateFile(templatePath) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fs.readFile(templatePath, { encoding: 'utf-8' }, (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(data);
                });
            });
        });
    }
    /***********************************************************************************************
     * Azure API accessors
     **********************************************************************************************/
    /**
     * Use the Azure API to create a new resource group
     */
    createResourceGroup(client, location, resourceGroupName) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger({
                status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_INFO,
                message: `> Creating resource group ...`,
            });
            const param = {
                location: location,
            };
            return yield client.resourceGroups.createOrUpdate(resourceGroupName, param);
        });
    }
    /**
     * Validate the deployment using the Azure API
     */
    validateDeployment(client, templatePath, location, resourceGroupName, deployName, templateParam) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger({
                status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_INFO,
                message: '> Validating Azure deployment ...',
            });
            const templateFile = yield this.readTemplateFile(templatePath);
            const deployParam = {
                properties: {
                    template: JSON.parse(templateFile),
                    parameters: templateParam,
                    mode: 'Incremental',
                },
            };
            return yield client.deployments.validate(resourceGroupName, deployName, deployParam);
        });
    }
    /**
     * Using an ARM template, provision a bunch of resources
     */
    createDeployment(client, templatePath, location, resourceGroupName, deployName, templateParam) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger({
                status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_INFO,
                message: `> Deploying Azure services (this could take a while)...`,
            });
            const templateFile = yield this.readTemplateFile(templatePath);
            const deployParam = {
                properties: {
                    template: JSON.parse(templateFile),
                    parameters: templateParam,
                    mode: 'Incremental',
                },
            };
            return yield client.deployments.createOrUpdate(resourceGroupName, deployName, deployParam);
        });
    }
    createApp(graphClient, displayName, appPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const createRes = yield graphClient.applications.create({
                displayName: displayName,
                passwordCredentials: [
                    {
                        value: appPassword,
                        startDate: new Date(),
                        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
                    },
                ],
                availableToOtherTenants: true,
                replyUrls: ['https://token.botframework.com/.auth/web/redirect'],
            });
            return createRes;
        });
    }
    /**
     * For more information about this api, please refer to this doc: https://docs.microsoft.com/en-us/rest/api/resources/Tenants/List
     */
    getTenantId() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.accessToken) {
                throw new Error('Error: Missing access token. Please provide a non-expired Azure access token. Tokens can be obtained by running az account get-access-token');
            }
            if (!this.subId) {
                throw new Error(`Error: Missing subscription Id. Please provide a valid Azure subscription id.`);
            }
            try {
                const tenantUrl = `https://management.azure.com/subscriptions/${this.subId}?api-version=2020-01-01`;
                const options = {
                    headers: { Authorization: `Bearer ${this.accessToken}` },
                };
                const response = yield rp.get(tenantUrl, options);
                const jsonRes = JSON.parse(response);
                if (jsonRes.tenantId === undefined) {
                    throw new Error(`No tenants found in the account.`);
                }
                return jsonRes.tenantId;
            }
            catch (err) {
                throw new Error(`Get Tenant Id Failed, details: ${this.getErrorMesssage(err)}`);
            }
        });
    }
    /**
     * Provision a set of Azure resources for use with a bot
     */
    create(name, location, environment, appPassword, createLuisResource = true, createLuisAuthoringResource = true, createCosmosDb = true, createStorage = true, createAppInsights = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.tenantId) {
                this.tenantId = yield this.getTenantId();
            }
            const graphCreds = new ms_rest_nodeauth_1.DeviceTokenCredentials(this.creds.clientId, this.tenantId, this.creds.username, 'graph', this.creds.environment, this.creds.tokenCache);
            const graphClient = new graph_1.GraphRbacManagementClient(graphCreds, this.tenantId, {
                baseUri: 'https://graph.windows.net',
            });
            const settings = {};
            // Validate settings
            let appId = settings.MicrosoftAppId;
            // If the appId is not specified, create one
            if (!appId) {
                // this requires an app password. if one not specified, fail.
                if (!appPassword) {
                    this.logger({
                        status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_INFO,
                        message: `App password is required`,
                    });
                    throw new Error(`App password is required`);
                }
                this.logger({
                    status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_INFO,
                    message: '> Creating App Registration ...',
                });
                // create the app registration
                const appCreated = yield this.createApp(graphClient, name, appPassword);
                this.logger({
                    status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_INFO,
                    message: appCreated,
                });
                // use the newly created app
                appId = appCreated.appId;
            }
            this.logger({
                status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_INFO,
                message: `> Create App Id Success! ID: ${appId}`,
            });
            const resourceGroupName = `${name}-${environment}`;
            // timestamp will be used as deployment name
            const timeStamp = new Date().getTime().toString();
            const client = new arm_resources_1.ResourceManagementClient(this.creds, this.subId);
            // Create a resource group to contain the new resources
            const rpres = yield this.createResourceGroup(client, location, resourceGroupName);
            this.logger({
                status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_INFO,
                message: rpres,
            });
            // Caste the parameters into the right format
            const deploymentTemplateParam = this.getDeploymentTemplateParam(appId, appPassword, location, name, createLuisAuthoringResource, createLuisResource, createAppInsights, createCosmosDb, createStorage);
            this.logger({
                status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_INFO,
                message: deploymentTemplateParam,
            });
            // Validate the deployment using the Azure API
            const validation = yield this.validateDeployment(client, this.templatePath, location, resourceGroupName, timeStamp, deploymentTemplateParam);
            this.logger({
                status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_INFO,
                message: validation,
            });
            // Handle validation errors
            if (validation.error) {
                this.logger({
                    status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_ERROR,
                    message: `! Template is not valid with provided parameters. Review the log for more information.`,
                });
                this.logger({
                    status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_ERROR,
                    message: `! Error: ${validation.error.message}`,
                });
                this.logger({
                    status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_ERROR,
                    message: `+ To delete this resource group, run 'az group delete -g ${resourceGroupName} --no-wait'`,
                });
                this.logger({
                    status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_ERROR_DETAILS,
                    message: validation.error.details,
                });
                throw new Error(`! Error: ${validation.error.message}`);
            }
            // Create the entire stack of resources inside the new resource group
            // this is controlled by an ARM template identified in this.templatePath
            const deployment = yield this.createDeployment(client, this.templatePath, location, resourceGroupName, timeStamp, deploymentTemplateParam);
            this.logger({
                status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_INFO,
                message: deployment,
            });
            // Handle errors
            // eslint-disable-next-line no-underscore-dangle
            if (deployment._response.status != 200) {
                this.logger({
                    status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_ERROR,
                    message: `! Template is not valid with provided parameters. Review the log for more information.`,
                });
                this.logger({
                    status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_ERROR,
                    message: `! Error: ${validation.error}`,
                });
                this.logger({
                    status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_ERROR,
                    message: `+ To delete this resource group, run 'az group delete -g ${resourceGroupName} --no-wait'`,
                });
                throw new Error(`! Error: ${validation.error}`);
            }
            // If application insights created, update the application insights settings in azure bot service
            if (createAppInsights) {
                this.logger({
                    status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_INFO,
                    message: `> Linking Application Insights settings to Bot Service ...`,
                });
                const appinsightsClient = new arm_appinsights_1.ApplicationInsightsManagementClient(this.creds, this.subId);
                const appComponents = yield appinsightsClient.components.get(resourceGroupName, resourceGroupName);
                const appinsightsId = appComponents.appId;
                const appinsightsInstrumentationKey = appComponents.instrumentationKey;
                const apiKeyOptions = {
                    name: `${resourceGroupName}-provision-${timeStamp}`,
                    linkedReadProperties: [
                        `/subscriptions/${this.subId}/resourceGroups/${resourceGroupName}/providers/microsoft.insights/components/${resourceGroupName}/api`,
                        `/subscriptions/${this.subId}/resourceGroups/${resourceGroupName}/providers/microsoft.insights/components/${resourceGroupName}/agentconfig`,
                    ],
                    linkedWriteProperties: [
                        `/subscriptions/${this.subId}/resourceGroups/${resourceGroupName}/providers/microsoft.insights/components/${resourceGroupName}/annotations`,
                    ],
                };
                const appinsightsApiKeyResponse = yield appinsightsClient.aPIKeys.create(resourceGroupName, resourceGroupName, apiKeyOptions);
                const appinsightsApiKey = appinsightsApiKeyResponse.apiKey;
                this.logger({
                    status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_INFO,
                    message: `> AppInsights AppId: ${appinsightsId} ...`,
                });
                this.logger({
                    status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_INFO,
                    message: `> AppInsights InstrumentationKey: ${appinsightsInstrumentationKey} ...`,
                });
                this.logger({
                    status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_INFO,
                    message: `> AppInsights ApiKey: ${appinsightsApiKey} ...`,
                });
                if (appinsightsId && appinsightsInstrumentationKey && appinsightsApiKey) {
                    const botServiceClient = new arm_botservice_1.AzureBotService(this.creds, this.subId);
                    const botCreated = yield botServiceClient.bots.get(resourceGroupName, name);
                    if (botCreated.properties) {
                        botCreated.properties.developerAppInsightKey = appinsightsInstrumentationKey;
                        botCreated.properties.developerAppInsightsApiKey = appinsightsApiKey;
                        botCreated.properties.developerAppInsightsApplicationId = appinsightsId;
                        const botUpdateResult = yield botServiceClient.bots.update(resourceGroupName, name, botCreated);
                        // eslint-disable-next-line no-underscore-dangle
                        if (botUpdateResult._response.status != 200) {
                            this.logger({
                                status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_ERROR,
                                message: `! Something went wrong while trying to link Application Insights settings to Bot Service Result: ${JSON.stringify(botUpdateResult)}`,
                            });
                            throw new Error(`Linking Application Insights Failed.`);
                        }
                        this.logger({
                            status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_INFO,
                            message: `> Linking Application Insights settings to Bot Service Success!`,
                        });
                    }
                    else {
                        this.logger({
                            status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_WARNING,
                            message: `! The Bot doesn't have a keys properties to update.`,
                        });
                    }
                }
            }
            // Validate that everything was successfully created.
            // Then, update the settings file with information about the new resources
            const updateResult = yield this.updateDeploymentJsonFile(client, resourceGroupName, timeStamp, appId, appPassword);
            this.logger({
                status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_INFO,
                message: updateResult,
            });
            // Handle errors
            if (!updateResult) {
                const operations = yield client.deploymentOperations.list(resourceGroupName, timeStamp);
                if (operations) {
                    const failedOperations = operations.filter((value) => { var _a; return ((_a = value === null || value === void 0 ? void 0 : value.properties) === null || _a === void 0 ? void 0 : _a.statusMessage.error) !== null; });
                    if (failedOperations) {
                        failedOperations.forEach((operation) => {
                            var _a, _b, _c, _d, _e, _f, _g;
                            switch ((_a = operation === null || operation === void 0 ? void 0 : operation.properties) === null || _a === void 0 ? void 0 : _a.statusMessage.error.code) {
                                case 'MissingRegistrationForLocation':
                                    this.logger({
                                        status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_ERROR,
                                        message: `! Deployment failed for resource of type ${(_c = (_b = operation === null || operation === void 0 ? void 0 : operation.properties) === null || _b === void 0 ? void 0 : _b.targetResource) === null || _c === void 0 ? void 0 : _c.resourceType}. This resource is not avaliable in the location provided.`,
                                    });
                                    break;
                                default:
                                    this.logger({
                                        status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_ERROR,
                                        message: `! Deployment failed for resource of type ${(_e = (_d = operation === null || operation === void 0 ? void 0 : operation.properties) === null || _d === void 0 ? void 0 : _d.targetResource) === null || _e === void 0 ? void 0 : _e.resourceType}.`,
                                    });
                                    this.logger({
                                        status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_ERROR,
                                        message: `! Code: ${(_f = operation === null || operation === void 0 ? void 0 : operation.properties) === null || _f === void 0 ? void 0 : _f.statusMessage.error.code}.`,
                                    });
                                    this.logger({
                                        status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_ERROR,
                                        message: `! Message: ${(_g = operation === null || operation === void 0 ? void 0 : operation.properties) === null || _g === void 0 ? void 0 : _g.statusMessage.error.message}.`,
                                    });
                                    break;
                            }
                        });
                    }
                }
                else {
                    this.logger({
                        status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_ERROR,
                        message: `! Deployment failed. Please refer to the log file for more information.`,
                    });
                }
            }
            this.logger({
                status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_SUCCESS,
                message: `+ To delete this resource group, run 'az group delete -g ${resourceGroupName} --no-wait'`,
            });
            return updateResult;
        });
    }
}
exports.BotProjectProvision = BotProjectProvision;
//# sourceMappingURL=provision.js.map