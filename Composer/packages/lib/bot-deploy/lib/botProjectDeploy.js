'use strict';
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function () {
            return m[k];
          },
        });
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.');
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t = op[0] & 2 ? y['return'] : op[0] ? y['throw'] || ((t = y['return']) && t.call(y), 0) : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (!((t = _.trys), (t = t.length > 0 && t[t.length - 1])) && (op[0] === 6 || op[0] === 2)) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.BotProjectDeploy = void 0;
var path = __importStar(require('path'));
var util = __importStar(require('util'));
var arm_resources_1 = require('@azure/arm-resources');
var arm_appinsights_1 = require('@azure/arm-appinsights');
var arm_botservice_1 = require('@azure/arm-botservice');
var graph_1 = require('@azure/graph');
var ms_rest_nodeauth_1 = require('@azure/ms-rest-nodeauth');
var fs = __importStar(require('fs-extra'));
var rp = __importStar(require('request-promise'));
var botProjectLoggerType_1 = require('./botProjectLoggerType');
var archiver = require('archiver');
var exec = util.promisify(require('child_process').exec);
var promisify = require('util').promisify;
var luBuild = require('@microsoft/bf-lu/lib/parser/lubuild/builder.js');
var readdir = promisify(fs.readdir);
var BotProjectDeploy = /** @class */ (function () {
  function BotProjectDeploy(config) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    // Will be assigned by create or deploy
    this.tenantId = '';
    this.subId = config.subId;
    this.logger = config.logger;
    this.accessToken = config.accessToken;
    this.creds = config.creds;
    this.projPath = config.projPath;
    // set path to .deployment file which points at the BotProject.csproj
    this.deployFilePath =
      (_a = config.deployFilePath) !== null && _a !== void 0 ? _a : path.join(this.projPath, '.deployment');
    // path to the zipped assets
    this.zipPath = (_b = config.zipPath) !== null && _b !== void 0 ? _b : path.join(this.projPath, 'code.zip');
    // path to the built, ready to deploy code assets
    this.publishFolder =
      (_c = config.publishFolder) !== null && _c !== void 0
        ? _c
        : path.join(this.projPath, 'bin', 'Release', 'netcoreapp3.1');
    // path to the source appsettings.deployment.json file
    this.settingsPath =
      (_d = config.settingsPath) !== null && _d !== void 0
        ? _d
        : path.join(this.projPath, 'appsettings.deployment.json');
    // path to the deployed settings file that contains additional luis information
    this.deploymentSettingsPath =
      (_e = config.deploymentSettingsPath) !== null && _e !== void 0
        ? _e
        : path.join(this.publishFolder, 'appsettings.deployment.json');
    // path to the ARM template
    // this is currently expected to live in the code project
    this.templatePath =
      (_f = config.templatePath) !== null && _f !== void 0
        ? _f
        : path.join(this.projPath, 'DeploymentTemplates', 'template-with-preexisting-rg.json');
    // path to the dotnet project file
    this.dotnetProjectPath =
      (_g = config.dotnetProjectPath) !== null && _g !== void 0
        ? _g
        : path.join(this.projPath, 'Microsoft.BotFramework.Composer.WebApp.csproj');
    // path to the built, ready to deploy declarative assets
    this.remoteBotPath =
      (_h = config.remoteBotPath) !== null && _h !== void 0 ? _h : path.join(this.publishFolder, 'ComposerDialogs');
    // path to the ready to deploy generated folder
    this.generatedFolder =
      (_j = config.generatedFolder) !== null && _j !== void 0 ? _j : path.join(this.remoteBotPath, 'generated');
  }
  BotProjectDeploy.prototype.getErrorMesssage = function (err) {
    if (err.body) {
      if (err.body.error) {
        if (err.body.error.details) {
          var details = err.body.error.details;
          var errMsg = '';
          for (var _i = 0, details_1 = details; _i < details_1.length; _i++) {
            var detail = details_1[_i];
            errMsg += detail.message;
          }
          return errMsg;
        } else {
          return err.body.error.message;
        }
      } else {
        return JSON.stringify(err.body, null, 2);
      }
    } else {
      return JSON.stringify(err, null, 2);
    }
  };
  BotProjectDeploy.prototype.pack = function (scope) {
    return {
      value: scope,
    };
  };
  /**
   * For more information about this api, please refer to this doc: https://docs.microsoft.com/en-us/rest/api/resources/Tenants/List
   */
  BotProjectDeploy.prototype.getTenantId = function () {
    return __awaiter(this, void 0, void 0, function () {
      var tenantUrl, options, response, jsonRes, err_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!this.accessToken) {
              throw new Error(
                'Error: Missing access token. Please provide a non-expired Azure access token. Tokens can be obtained by running az account get-access-token'
              );
            }
            if (!this.subId) {
              throw new Error('Error: Missing subscription Id. Please provide a valid Azure subscription id.');
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            tenantUrl = 'https://management.azure.com/subscriptions/' + this.subId + '?api-version=2020-01-01';
            options = {
              headers: { Authorization: 'Bearer ' + this.accessToken },
            };
            return [4 /*yield*/, rp.get(tenantUrl, options)];
          case 2:
            response = _a.sent();
            jsonRes = JSON.parse(response);
            if (jsonRes.tenantId === undefined) {
              throw new Error('No tenants found in the account.');
            }
            return [2 /*return*/, jsonRes.tenantId];
          case 3:
            err_1 = _a.sent();
            throw new Error('Get Tenant Id Failed, details: ' + this.getErrorMesssage(err_1));
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  BotProjectDeploy.prototype.unpackObject = function (output) {
    var unpacked = {};
    for (var key in output) {
      var objValue = output[key];
      if (objValue.value) {
        unpacked[key] = objValue.value;
      }
    }
    return unpacked;
  };
  /**
   * Format the parameters
   */
  BotProjectDeploy.prototype.getDeploymentTemplateParam = function (
    appId,
    appPwd,
    location,
    name,
    shouldCreateAuthoringResource,
    shouldCreateLuisResource,
    useAppInsights,
    useCosmosDb,
    useStorage
  ) {
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
  };
  BotProjectDeploy.prototype.readTemplateFile = function (templatePath) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          new Promise(function (resolve, reject) {
            fs.readFile(templatePath, { encoding: 'utf-8' }, function (err, data) {
              if (err) {
                reject(err);
              }
              resolve(data);
            });
          }),
        ];
      });
    });
  };
  /***********************************************************************************************
   * Azure API accessors
   **********************************************************************************************/
  /**
   * Use the Azure API to create a new resource group
   */
  BotProjectDeploy.prototype.createResourceGroup = function (client, location, resourceGroupName) {
    return __awaiter(this, void 0, void 0, function () {
      var param;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            this.logger({
              status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_INFO,
              message: '> Creating resource group ...',
            });
            param = {
              location: location,
            };
            return [4 /*yield*/, client.resourceGroups.createOrUpdate(resourceGroupName, param)];
          case 1:
            return [2 /*return*/, _a.sent()];
        }
      });
    });
  };
  /**
   * Validate the deployment using the Azure API
   */
  BotProjectDeploy.prototype.validateDeployment = function (
    client,
    templatePath,
    location,
    resourceGroupName,
    deployName,
    templateParam
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var templateFile, deployParam;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            this.logger({
              status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_INFO,
              message: '> Validating Azure deployment ...',
            });
            return [4 /*yield*/, this.readTemplateFile(templatePath)];
          case 1:
            templateFile = _a.sent();
            deployParam = {
              properties: {
                template: JSON.parse(templateFile),
                parameters: templateParam,
                mode: 'Incremental',
              },
            };
            return [4 /*yield*/, client.deployments.validate(resourceGroupName, deployName, deployParam)];
          case 2:
            return [2 /*return*/, _a.sent()];
        }
      });
    });
  };
  /**
   * Using an ARM template, provision a bunch of resources
   */
  BotProjectDeploy.prototype.createDeployment = function (
    client,
    templatePath,
    location,
    resourceGroupName,
    deployName,
    templateParam
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var templateFile, deployParam;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            this.logger({
              status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_INFO,
              message: '> Deploying Azure services (this could take a while)...',
            });
            return [4 /*yield*/, this.readTemplateFile(templatePath)];
          case 1:
            templateFile = _a.sent();
            deployParam = {
              properties: {
                template: JSON.parse(templateFile),
                parameters: templateParam,
                mode: 'Incremental',
              },
            };
            return [4 /*yield*/, client.deployments.createOrUpdate(resourceGroupName, deployName, deployParam)];
          case 2:
            return [2 /*return*/, _a.sent()];
        }
      });
    });
  };
  BotProjectDeploy.prototype.createApp = function (graphClient, displayName, appPassword) {
    return __awaiter(this, void 0, void 0, function () {
      var createRes;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              graphClient.applications.create({
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
              }),
            ];
          case 1:
            createRes = _a.sent();
            return [2 /*return*/, createRes];
        }
      });
    });
  };
  /**
   * Write updated settings back to the settings file
   */
  BotProjectDeploy.prototype.updateDeploymentJsonFile = function (
    client,
    resourceGroupName,
    deployName,
    appId,
    appPwd
  ) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
      var outputs, outputResult, applicationResult, outputObj, result;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, client.deployments.get(resourceGroupName, deployName)];
          case 1:
            outputs = _b.sent();
            if (
              (_a = outputs === null || outputs === void 0 ? void 0 : outputs.properties) === null || _a === void 0
                ? void 0
                : _a.outputs
            ) {
              outputResult = outputs.properties.outputs;
              applicationResult = {
                MicrosoftAppId: appId,
                MicrosoftAppPassword: appPwd,
              };
              outputObj = this.unpackObject(outputResult);
              result = {};
              Object.assign(result, outputObj, applicationResult);
              return [2 /*return*/, result];
            } else {
              return [2 /*return*/, null];
            }
            return [2 /*return*/];
        }
      });
    });
  };
  BotProjectDeploy.prototype.getFiles = function (dir) {
    return __awaiter(this, void 0, void 0, function () {
      var dirents, files;
      var _a;
      var _this = this;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, readdir(dir, { withFileTypes: true })];
          case 1:
            dirents = _b.sent();
            return [
              4 /*yield*/,
              Promise.all(
                dirents.map(function (dirent) {
                  var res = path.resolve(dir, dirent.name);
                  return dirent.isDirectory() ? _this.getFiles(res) : res;
                })
              ),
            ];
          case 2:
            files = _b.sent();
            return [2 /*return*/, (_a = Array.prototype).concat.apply(_a, files)];
        }
      });
    });
  };
  BotProjectDeploy.prototype.botPrepareDeploy = function (pathToDeploymentFile) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          new Promise(function (resolve, reject) {
            var data = '[config]\nproject = Microsoft.BotFramework.Composer.WebApp.csproj';
            fs.writeFile(pathToDeploymentFile, data, function (err) {
              if (err) {
                reject(err);
              }
              resolve();
            });
          }),
        ];
      });
    });
  };
  BotProjectDeploy.prototype.dotnetPublish = function (publishFolder, projFolder, botPath) {
    return __awaiter(this, void 0, void 0, function () {
      var remoteBotPath, localBotPath;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // perform the dotnet publish command
            // this builds the app and prepares it to be deployed
            // results in a built copy in publishFolder/
            return [
              4 /*yield*/,
              exec('dotnet publish "' + this.dotnetProjectPath + '" -c release -o "' + publishFolder + '" -v q'),
            ];
          case 1:
            // perform the dotnet publish command
            // this builds the app and prepares it to be deployed
            // results in a built copy in publishFolder/
            _a.sent();
            remoteBotPath = path.join(publishFolder, 'ComposerDialogs');
            localBotPath = path.join(projFolder, 'ComposerDialogs');
            if (!botPath) return [3 /*break*/, 3];
            this.logger({
              status: botProjectLoggerType_1.BotProjectDeployLoggerType.DEPLOY_INFO,
              message: 'Publishing dialogs from external bot project: ' + botPath,
            });
            return [
              4 /*yield*/,
              fs.copy(botPath, remoteBotPath, {
                overwrite: true,
                recursive: true,
              }),
            ];
          case 2:
            _a.sent();
            return [3 /*break*/, 5];
          case 3:
            return [
              4 /*yield*/,
              fs.copy(localBotPath, remoteBotPath, {
                overwrite: true,
                recursive: true,
              }),
            ];
          case 4:
            _a.sent();
            _a.label = 5;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  BotProjectDeploy.prototype.zipDirectory = function (source, out) {
    return __awaiter(this, void 0, void 0, function () {
      var archive, stream;
      return __generator(this, function (_a) {
        archive = archiver('zip', { zlib: { level: 9 } });
        stream = fs.createWriteStream(out);
        return [
          2 /*return*/,
          new Promise(function (resolve, reject) {
            archive
              .directory(source, false)
              .on('error', function (err) {
                return reject(err);
              })
              .pipe(stream);
            stream.on('close', function () {
              return resolve();
            });
            archive.finalize();
          }),
        ];
      });
    });
  };
  BotProjectDeploy.prototype.notEmptyLuisModel = function (file) {
    return fs.readFileSync(file).length > 0;
  };
  // Run through the lubuild process
  // This happens in the build folder, NOT in the original source folder
  BotProjectDeploy.prototype.publishLuis = function (
    name,
    environment,
    language,
    luisEndpoint,
    luisAuthoringEndpoint,
    luisEndpointKey,
    luisAuthoringKey,
    luisAuthoringRegion,
    luisResource
  ) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function () {
      var botFiles,
        modelFiles,
        builder,
        loadResult,
        buildResult,
        luisConfigFiles,
        luisAppIds,
        _i,
        luisConfigFiles_1,
        luisConfigFile,
        luisSettings,
        luisConfig,
        settings,
        jsonRes,
        getAccountUri,
        options,
        response,
        err_2,
        error,
        account,
        _e,
        _f,
        _g,
        k,
        luisAppId,
        luisAssignEndpoint,
        options,
        response;
      var _this = this;
      return __generator(this, function (_h) {
        switch (_h.label) {
          case 0:
            if (!(luisAuthoringKey && luisAuthoringRegion)) return [3 /*break*/, 23];
            return [4 /*yield*/, this.getFiles(this.remoteBotPath)];
          case 1:
            botFiles = _h.sent();
            modelFiles = botFiles.filter(function (name) {
              return name.endsWith('.lu') && _this.notEmptyLuisModel(name);
            });
            return [4 /*yield*/, fs.pathExists(this.generatedFolder)];
          case 2:
            if (!!_h.sent()) return [3 /*break*/, 4];
            return [4 /*yield*/, fs.mkdir(this.generatedFolder)];
          case 3:
            _h.sent();
            _h.label = 4;
          case 4:
            builder = new luBuild.Builder(function (msg) {
              return _this.logger({
                status: botProjectLoggerType_1.BotProjectDeployLoggerType.DEPLOY_INFO,
                message: msg,
              });
            });
            return [
              4 /*yield*/,
              builder.loadContents(modelFiles, language || '', environment || '', luisAuthoringRegion || ''),
            ];
          case 5:
            loadResult = _h.sent();
            if (!luisEndpoint) {
              luisEndpoint = 'https://' + luisAuthoringRegion + '.api.cognitive.microsoft.com';
            }
            if (!luisAuthoringEndpoint) {
              luisAuthoringEndpoint = luisEndpoint;
            }
            return [
              4 /*yield*/,
              builder.build(
                loadResult.luContents,
                loadResult.recognizers,
                luisAuthoringKey,
                luisAuthoringEndpoint,
                name,
                environment,
                language,
                false,
                loadResult.multiRecognizers,
                loadResult.settings
              ),
            ];
          case 6:
            buildResult = _h.sent();
            return [4 /*yield*/, builder.writeDialogAssets(buildResult, true, this.generatedFolder)];
          case 7:
            _h.sent();
            this.logger({
              status: botProjectLoggerType_1.BotProjectDeployLoggerType.DEPLOY_INFO,
              message: 'lubuild succeed',
            });
            return [4 /*yield*/, this.getFiles(this.remoteBotPath)];
          case 8:
            luisConfigFiles = _h.sent().filter(function (filename) {
              return filename.includes('luis.settings');
            });
            luisAppIds = {};
            (_i = 0), (luisConfigFiles_1 = luisConfigFiles);
            _h.label = 9;
          case 9:
            if (!(_i < luisConfigFiles_1.length)) return [3 /*break*/, 12];
            luisConfigFile = luisConfigFiles_1[_i];
            return [4 /*yield*/, fs.readJson(luisConfigFile)];
          case 10:
            luisSettings = _h.sent();
            Object.assign(luisAppIds, luisSettings.luis);
            _h.label = 11;
          case 11:
            _i++;
            return [3 /*break*/, 9];
          case 12:
            luisConfig = {
              endpoint: luisEndpoint,
              endpointKey: luisEndpointKey,
              authoringRegion: luisAuthoringRegion,
              authoringKey: luisAuthoringRegion,
            };
            Object.assign(luisConfig, luisAppIds);
            return [4 /*yield*/, fs.readJson(this.deploymentSettingsPath)];
          case 13:
            settings = _h.sent();
            settings.luis = luisConfig;
            return [
              4 /*yield*/,
              fs.writeJson(this.deploymentSettingsPath, settings, {
                spaces: 4,
              }),
            ];
          case 14:
            _h.sent();
            jsonRes = void 0;
            _h.label = 15;
          case 15:
            _h.trys.push([15, 17, , 18]);
            getAccountUri = luisEndpoint + '/luis/api/v2.0/azureaccounts';
            options = {
              headers: { Authorization: 'Bearer ' + this.accessToken, 'Ocp-Apim-Subscription-Key': luisAuthoringKey },
            };
            return [4 /*yield*/, rp.get(getAccountUri, options)];
          case 16:
            response = _h.sent();
            jsonRes = JSON.parse(response);
            return [3 /*break*/, 18];
          case 17:
            err_2 = _h.sent();
            error = JSON.parse(err_2.error);
            if (
              ((_a = error === null || error === void 0 ? void 0 : error.error) === null || _a === void 0
                ? void 0
                : _a.message) &&
              ((_b = error === null || error === void 0 ? void 0 : error.error) === null || _b === void 0
                ? void 0
                : _b.message.indexOf('access token expiry')) > 0
            ) {
              throw new Error(
                'Type: ' +
                  ((_c = error === null || error === void 0 ? void 0 : error.error) === null || _c === void 0
                    ? void 0
                    : _c.code) +
                  ', Message: ' +
                  ((_d = error === null || error === void 0 ? void 0 : error.error) === null || _d === void 0
                    ? void 0
                    : _d.message) +
                  ', run az account get-access-token, then replace the accessToken in your configuration'
              );
            } else {
              throw err_2;
            }
            return [3 /*break*/, 18];
          case 18:
            account = this.getAccount(jsonRes, luisResource ? luisResource : name + '-' + environment + '-luis');
            _e = [];
            for (_f in luisAppIds) _e.push(_f);
            _g = 0;
            _h.label = 19;
          case 19:
            if (!(_g < _e.length)) return [3 /*break*/, 22];
            k = _e[_g];
            luisAppId = luisAppIds[k];
            this.logger({
              status: botProjectLoggerType_1.BotProjectDeployLoggerType.DEPLOY_INFO,
              message: 'Assigning to luis app id: ' + luisAppId,
            });
            luisAssignEndpoint = luisEndpoint + '/luis/api/v2.0/apps/' + luisAppId + '/azureaccounts';
            options = {
              body: account,
              json: true,
              headers: { Authorization: 'Bearer ' + this.accessToken, 'Ocp-Apim-Subscription-Key': luisAuthoringKey },
            };
            return [4 /*yield*/, rp.post(luisAssignEndpoint, options)];
          case 20:
            response = _h.sent();
            this.logger({
              status: botProjectLoggerType_1.BotProjectDeployLoggerType.DEPLOY_INFO,
              message: response,
            });
            _h.label = 21;
          case 21:
            _g++;
            return [3 /*break*/, 19];
          case 22:
            this.logger({
              status: botProjectLoggerType_1.BotProjectDeployLoggerType.DEPLOY_INFO,
              message: 'Luis Publish Success! ...',
            });
            _h.label = 23;
          case 23:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Deploy a bot to a location
   */
  BotProjectDeploy.prototype.deploy = function (
    name,
    environment,
    luisAuthoringKey,
    luisAuthoringRegion,
    botPath,
    language,
    hostname,
    luisResource
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var settings, luisSettings, luisEndpointKey, luisEndpoint, luisAuthoringEndpoint, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 11, , 12]);
            if (!!fs.pathExistsSync(this.deployFilePath)) return [3 /*break*/, 2];
            return [4 /*yield*/, this.botPrepareDeploy(this.deployFilePath)];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            return [4 /*yield*/, fs.pathExists(this.zipPath)];
          case 3:
            if (!_a.sent()) return [3 /*break*/, 5];
            return [4 /*yield*/, fs.remove(this.zipPath)];
          case 4:
            _a.sent();
            _a.label = 5;
          case 5:
            // dotnet publish
            return [4 /*yield*/, this.dotnetPublish(this.publishFolder, this.projPath, botPath)];
          case 6:
            // dotnet publish
            _a.sent();
            return [4 /*yield*/, fs.readJSON(this.settingsPath)];
          case 7:
            settings = _a.sent();
            luisSettings = settings.luis;
            luisEndpointKey = '';
            luisEndpoint = '';
            luisAuthoringEndpoint = '';
            if (luisSettings) {
              // if luisAuthoringKey is not set, use the one from the luis settings
              luisAuthoringKey = luisAuthoringKey || luisSettings.authoringKey;
              luisAuthoringRegion = luisAuthoringRegion || luisSettings.region;
              luisEndpointKey = luisSettings.endpointKey;
              luisEndpoint = luisSettings.endpoint;
              luisAuthoringEndpoint = luisSettings.authoringEndpoint;
            }
            if (!language) {
              language = 'en-us';
            }
            return [
              4 /*yield*/,
              this.publishLuis(
                name,
                environment,
                language,
                luisEndpoint,
                luisAuthoringEndpoint,
                luisEndpointKey,
                luisAuthoringKey,
                luisAuthoringRegion,
                luisResource
              ),
            ];
          case 8:
            _a.sent();
            // Build a zip file of the project
            this.logger({
              status: botProjectLoggerType_1.BotProjectDeployLoggerType.DEPLOY_INFO,
              message: 'Packing up the bot service ...',
            });
            return [4 /*yield*/, this.zipDirectory(this.publishFolder, this.zipPath)];
          case 9:
            _a.sent();
            this.logger({
              status: botProjectLoggerType_1.BotProjectDeployLoggerType.DEPLOY_INFO,
              message: 'Packing Service Success!',
            });
            // Deploy the zip file to the web app
            this.logger({
              status: botProjectLoggerType_1.BotProjectDeployLoggerType.DEPLOY_INFO,
              message: 'Publishing to Azure ...',
            });
            return [4 /*yield*/, this.deployZip(this.accessToken, this.zipPath, name, environment, hostname)];
          case 10:
            _a.sent();
            this.logger({
              status: botProjectLoggerType_1.BotProjectDeployLoggerType.DEPLOY_SUCCESS,
              message: 'Publish To Azure Success!',
            });
            return [3 /*break*/, 12];
          case 11:
            error_1 = _a.sent();
            this.logger({
              status: botProjectLoggerType_1.BotProjectDeployLoggerType.DEPLOY_ERROR,
              message: JSON.stringify(error_1, Object.getOwnPropertyNames(error_1)),
            });
            throw error_1;
          case 12:
            return [2 /*return*/];
        }
      });
    });
  };
  BotProjectDeploy.prototype.getAccount = function (accounts, filter) {
    for (var _i = 0, accounts_1 = accounts; _i < accounts_1.length; _i++) {
      var account = accounts_1[_i];
      if (account.AccountName === filter) {
        return account;
      }
    }
  };
  // Upload the zip file to Azure
  BotProjectDeploy.prototype.deployZip = function (token, zipPath, name, env, hostname) {
    return __awaiter(this, void 0, void 0, function () {
      var publishEndpoint, fileContent, options, response, err_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            this.logger({
              status: botProjectLoggerType_1.BotProjectDeployLoggerType.DEPLOY_INFO,
              message: 'Retrieve publishing details ...',
            });
            publishEndpoint =
              'https://' + (hostname ? hostname : name + '-' + env) + '.scm.azurewebsites.net/zipdeploy';
            return [4 /*yield*/, fs.readFile(zipPath)];
          case 1:
            fileContent = _a.sent();
            options = {
              body: fileContent,
              encoding: null,
              headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/zip',
                'Content-Length': fileContent.length,
              },
            };
            _a.label = 2;
          case 2:
            _a.trys.push([2, 4, , 5]);
            return [4 /*yield*/, rp.post(publishEndpoint, options)];
          case 3:
            response = _a.sent();
            this.logger({
              status: botProjectLoggerType_1.BotProjectDeployLoggerType.DEPLOY_INFO,
              message: response,
            });
            return [3 /*break*/, 5];
          case 4:
            err_3 = _a.sent();
            if (err_3.statusCode === 403) {
              throw new Error(
                'Token expired, please run az account get-access-token, then replace the accessToken in your configuration'
              );
            } else {
              throw err_3;
            }
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Provision a set of Azure resources for use with a bot
   */
  BotProjectDeploy.prototype.create = function (
    name,
    location,
    environment,
    appPassword,
    createLuisResource,
    createLuisAuthoringResource,
    createCosmosDb,
    createStorage,
    createAppInsights
  ) {
    if (createLuisResource === void 0) {
      createLuisResource = true;
    }
    if (createLuisAuthoringResource === void 0) {
      createLuisAuthoringResource = true;
    }
    if (createCosmosDb === void 0) {
      createCosmosDb = true;
    }
    if (createStorage === void 0) {
      createStorage = true;
    }
    if (createAppInsights === void 0) {
      createAppInsights = true;
    }
    return __awaiter(this, void 0, void 0, function () {
      var _a,
        graphCreds,
        graphClient,
        settings,
        appId,
        appCreated,
        resourceGroupName,
        timeStamp,
        client,
        rpres,
        deploymentTemplateParam,
        validation,
        deployment,
        appinsightsClient,
        appComponents,
        appinsightsId,
        appinsightsInstrumentationKey,
        apiKeyOptions,
        appinsightsApiKeyResponse,
        appinsightsApiKey,
        botServiceClient,
        botCreated,
        botUpdateResult,
        updateResult,
        operations,
        failedOperations;
      var _this = this;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            if (!!this.tenantId) return [3 /*break*/, 2];
            _a = this;
            return [4 /*yield*/, this.getTenantId()];
          case 1:
            _a.tenantId = _b.sent();
            _b.label = 2;
          case 2:
            graphCreds = new ms_rest_nodeauth_1.DeviceTokenCredentials(
              this.creds.clientId,
              this.tenantId,
              this.creds.username,
              'graph',
              this.creds.environment,
              this.creds.tokenCache
            );
            graphClient = new graph_1.GraphRbacManagementClient(graphCreds, this.tenantId, {
              baseUri: 'https://graph.windows.net',
            });
            settings = {};
            if (!fs.existsSync(this.settingsPath)) return [3 /*break*/, 4];
            return [4 /*yield*/, fs.readJson(this.settingsPath)];
          case 3:
            settings = _b.sent();
            _b.label = 4;
          case 4:
            appId = settings.MicrosoftAppId;
            if (!!appId) return [3 /*break*/, 6];
            // this requires an app password. if one not specified, fail.
            if (!appPassword) {
              this.logger({
                status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_INFO,
                message: 'App password is required',
              });
              throw new Error('App password is required');
            }
            this.logger({
              status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_INFO,
              message: '> Creating App Registration ...',
            });
            return [4 /*yield*/, this.createApp(graphClient, name, appPassword)];
          case 5:
            appCreated = _b.sent();
            this.logger({
              status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_INFO,
              message: appCreated,
            });
            // use the newly created app
            appId = appCreated.appId;
            _b.label = 6;
          case 6:
            this.logger({
              status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_INFO,
              message: '> Create App Id Success! ID: ' + appId,
            });
            resourceGroupName = name + '-' + environment;
            timeStamp = new Date().getTime().toString();
            client = new arm_resources_1.ResourceManagementClient(this.creds, this.subId);
            return [4 /*yield*/, this.createResourceGroup(client, location, resourceGroupName)];
          case 7:
            rpres = _b.sent();
            this.logger({
              status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_INFO,
              message: rpres,
            });
            deploymentTemplateParam = this.getDeploymentTemplateParam(
              appId,
              appPassword,
              location,
              name,
              createLuisAuthoringResource,
              createLuisResource,
              createAppInsights,
              createCosmosDb,
              createStorage
            );
            this.logger({
              status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_INFO,
              message: deploymentTemplateParam,
            });
            return [
              4 /*yield*/,
              this.validateDeployment(
                client,
                this.templatePath,
                location,
                resourceGroupName,
                timeStamp,
                deploymentTemplateParam
              ),
            ];
          case 8:
            validation = _b.sent();
            this.logger({
              status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_INFO,
              message: validation,
            });
            // Handle validation errors
            if (validation.error) {
              this.logger({
                status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_ERROR,
                message: '! Template is not valid with provided parameters. Review the log for more information.',
              });
              this.logger({
                status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_ERROR,
                message: '! Error: ' + validation.error.message,
              });
              this.logger({
                status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_ERROR,
                message:
                  "+ To delete this resource group, run 'az group delete -g " + resourceGroupName + " --no-wait'",
              });
              this.logger({
                status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_ERROR_DETAILS,
                message: validation.error.details,
              });
              throw new Error('! Error: ' + validation.error.message);
            }
            return [
              4 /*yield*/,
              this.createDeployment(
                client,
                this.templatePath,
                location,
                resourceGroupName,
                timeStamp,
                deploymentTemplateParam
              ),
            ];
          case 9:
            deployment = _b.sent();
            this.logger({
              status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_INFO,
              message: deployment,
            });
            // Handle errors
            if (deployment._response.status != 200) {
              this.logger({
                status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_ERROR,
                message: '! Template is not valid with provided parameters. Review the log for more information.',
              });
              this.logger({
                status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_ERROR,
                message: '! Error: ' + validation.error,
              });
              this.logger({
                status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_ERROR,
                message:
                  "+ To delete this resource group, run 'az group delete -g " + resourceGroupName + " --no-wait'",
              });
              throw new Error('! Error: ' + validation.error);
            }
            if (!createAppInsights) return [3 /*break*/, 15];
            this.logger({
              status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_INFO,
              message: '> Linking Application Insights settings to Bot Service ...',
            });
            appinsightsClient = new arm_appinsights_1.ApplicationInsightsManagementClient(this.creds, this.subId);
            return [4 /*yield*/, appinsightsClient.components.get(resourceGroupName, resourceGroupName)];
          case 10:
            appComponents = _b.sent();
            appinsightsId = appComponents.appId;
            appinsightsInstrumentationKey = appComponents.instrumentationKey;
            apiKeyOptions = {
              name: resourceGroupName + '-provision-' + timeStamp,
              linkedReadProperties: [
                '/subscriptions/' +
                  this.subId +
                  '/resourceGroups/' +
                  resourceGroupName +
                  '/providers/microsoft.insights/components/' +
                  resourceGroupName +
                  '/api',
                '/subscriptions/' +
                  this.subId +
                  '/resourceGroups/' +
                  resourceGroupName +
                  '/providers/microsoft.insights/components/' +
                  resourceGroupName +
                  '/agentconfig',
              ],
              linkedWriteProperties: [
                '/subscriptions/' +
                  this.subId +
                  '/resourceGroups/' +
                  resourceGroupName +
                  '/providers/microsoft.insights/components/' +
                  resourceGroupName +
                  '/annotations',
              ],
            };
            return [4 /*yield*/, appinsightsClient.aPIKeys.create(resourceGroupName, resourceGroupName, apiKeyOptions)];
          case 11:
            appinsightsApiKeyResponse = _b.sent();
            appinsightsApiKey = appinsightsApiKeyResponse.apiKey;
            this.logger({
              status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_INFO,
              message: '> AppInsights AppId: ' + appinsightsId + ' ...',
            });
            this.logger({
              status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_INFO,
              message: '> AppInsights InstrumentationKey: ' + appinsightsInstrumentationKey + ' ...',
            });
            this.logger({
              status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_INFO,
              message: '> AppInsights ApiKey: ' + appinsightsApiKey + ' ...',
            });
            if (!(appinsightsId && appinsightsInstrumentationKey && appinsightsApiKey)) return [3 /*break*/, 15];
            botServiceClient = new arm_botservice_1.AzureBotService(this.creds, this.subId);
            return [4 /*yield*/, botServiceClient.bots.get(resourceGroupName, name)];
          case 12:
            botCreated = _b.sent();
            if (!botCreated.properties) return [3 /*break*/, 14];
            botCreated.properties.developerAppInsightKey = appinsightsInstrumentationKey;
            botCreated.properties.developerAppInsightsApiKey = appinsightsApiKey;
            botCreated.properties.developerAppInsightsApplicationId = appinsightsId;
            return [4 /*yield*/, botServiceClient.bots.update(resourceGroupName, name, botCreated)];
          case 13:
            botUpdateResult = _b.sent();
            if (botUpdateResult._response.status != 200) {
              this.logger({
                status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_ERROR,
                message:
                  '! Something went wrong while trying to link Application Insights settings to Bot Service Result: ' +
                  JSON.stringify(botUpdateResult),
              });
              throw new Error('Linking Application Insights Failed.');
            }
            this.logger({
              status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_INFO,
              message: '> Linking Application Insights settings to Bot Service Success!',
            });
            return [3 /*break*/, 15];
          case 14:
            this.logger({
              status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_WARNING,
              message: "! The Bot doesn't have a keys properties to update.",
            });
            _b.label = 15;
          case 15:
            return [
              4 /*yield*/,
              this.updateDeploymentJsonFile(client, resourceGroupName, timeStamp, appId, appPassword),
            ];
          case 16:
            updateResult = _b.sent();
            this.logger({
              status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_INFO,
              message: updateResult,
            });
            if (!!updateResult) return [3 /*break*/, 18];
            return [4 /*yield*/, client.deploymentOperations.list(resourceGroupName, timeStamp)];
          case 17:
            operations = _b.sent();
            if (operations) {
              failedOperations = operations.filter(function (value) {
                var _a;
                return (
                  ((_a = value === null || value === void 0 ? void 0 : value.properties) === null || _a === void 0
                    ? void 0
                    : _a.statusMessage.error) !== null
                );
              });
              if (failedOperations) {
                failedOperations.forEach(function (operation) {
                  var _a, _b, _c, _d, _e, _f, _g;
                  switch (
                    (_a = operation === null || operation === void 0 ? void 0 : operation.properties) === null ||
                    _a === void 0
                      ? void 0
                      : _a.statusMessage.error.code
                  ) {
                    case 'MissingRegistrationForLocation':
                      _this.logger({
                        status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_ERROR,
                        message:
                          '! Deployment failed for resource of type ' +
                          ((_c =
                            (_b = operation === null || operation === void 0 ? void 0 : operation.properties) ===
                              null || _b === void 0
                              ? void 0
                              : _b.targetResource) === null || _c === void 0
                            ? void 0
                            : _c.resourceType) +
                          '. This resource is not avaliable in the location provided.',
                      });
                      break;
                    default:
                      _this.logger({
                        status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_ERROR,
                        message:
                          '! Deployment failed for resource of type ' +
                          ((_e =
                            (_d = operation === null || operation === void 0 ? void 0 : operation.properties) ===
                              null || _d === void 0
                              ? void 0
                              : _d.targetResource) === null || _e === void 0
                            ? void 0
                            : _e.resourceType) +
                          '.',
                      });
                      _this.logger({
                        status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_ERROR,
                        message:
                          '! Code: ' +
                          ((_f = operation === null || operation === void 0 ? void 0 : operation.properties) === null ||
                          _f === void 0
                            ? void 0
                            : _f.statusMessage.error.code) +
                          '.',
                      });
                      _this.logger({
                        status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_ERROR,
                        message:
                          '! Message: ' +
                          ((_g = operation === null || operation === void 0 ? void 0 : operation.properties) === null ||
                          _g === void 0
                            ? void 0
                            : _g.statusMessage.error.message) +
                          '.',
                      });
                      break;
                  }
                });
              }
            } else {
              this.logger({
                status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_ERROR,
                message: '! Deployment failed. Please refer to the log file for more information.',
              });
            }
            _b.label = 18;
          case 18:
            this.logger({
              status: botProjectLoggerType_1.BotProjectDeployLoggerType.PROVISION_SUCCESS,
              message: "+ To delete this resource group, run 'az group delete -g " + resourceGroupName + " --no-wait'",
            });
            return [2 /*return*/, updateResult];
        }
      });
    });
  };
  /**
   * createAndDeploy
   * provision the Azure resources AND deploy a bot to those resources
   */
  BotProjectDeploy.prototype.createAndDeploy = function (
    name,
    location,
    environment,
    appPassword,
    luisAuthoringKey,
    luisAuthoringRegion
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.create(name, location, environment, appPassword)];
          case 1:
            _a.sent();
            return [4 /*yield*/, this.deploy(name, environment, luisAuthoringKey, luisAuthoringRegion)];
          case 2:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  return BotProjectDeploy;
})();
exports.BotProjectDeploy = BotProjectDeploy;
//# sourceMappingURL=botProjectDeploy.js.map
