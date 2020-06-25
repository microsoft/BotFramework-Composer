'use strict';
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const path_1 = __importDefault(require('path'));
const bot_deploy_1 = require('@bfc/bot-deploy');
const uuid_1 = require('uuid');
const md5_1 = __importDefault(require('md5'));
const fs_extra_1 = require('fs-extra');
const plugin_loader_1 = require('@bfc/plugin-loader');
const schema_1 = __importDefault(require('./schema'));
// This option controls whether the history is serialized to a file between sessions with Composer
// set to TRUE for history to be saved to disk
// set to FALSE for history to be cached in memory only
const PERSIST_HISTORY = false;
const DEFAULT_RUNTIME = 'azurefunctions';
const instructions = `To create a publish configuration, follow the instructions in the README file in your bot project folder.`;
class AzurePublisher {
  constructor() {
    this.baseRuntimeFolder = process.env.AZURE_PUBLISH_PATH || path_1.default.resolve(__dirname, `publishBots`);
    this.getRuntimeFolder = (key) => {
      return path_1.default.resolve(this.baseRuntimeFolder, `${key}`);
    };
    this.getProjectFolder = (key, template) => {
      return path_1.default.resolve(this.baseRuntimeFolder, `${key}/${template}`);
    };
    this.getBotFolder = (key, template) =>
      path_1.default.resolve(this.getProjectFolder(key, template), 'ComposerDialogs');
    this.getSettingsPath = (key, template) =>
      path_1.default.resolve(this.getBotFolder(key, template), 'settings/appsettings.json');
    this.init = (botFiles, settings, srcTemplate, resourcekey) =>
      __awaiter(this, void 0, void 0, function* () {
        const runtimeExist = yield fs_extra_1.pathExists(this.getRuntimeFolder(resourcekey));
        const botExist = yield fs_extra_1.pathExists(this.getBotFolder(resourcekey, DEFAULT_RUNTIME));
        const botFolder = this.getBotFolder(resourcekey, DEFAULT_RUNTIME);
        const runtimeFolder = this.getRuntimeFolder(resourcekey);
        const settingsPath = this.getSettingsPath(resourcekey, DEFAULT_RUNTIME);
        // deploy resource exist
        yield fs_extra_1.emptyDir(runtimeFolder);
        if (!runtimeExist) {
          fs_extra_1.mkdirSync(runtimeFolder, { recursive: true });
        }
        if (!botExist) {
          fs_extra_1.mkdirSync(botFolder, { recursive: true });
        }
        // save bot files
        for (const file of botFiles) {
          const filePath = path_1.default.resolve(botFolder, file.relativePath);
          if (!(yield fs_extra_1.pathExists(path_1.default.dirname(filePath)))) {
            fs_extra_1.mkdirSync(path_1.default.dirname(filePath), { recursive: true });
          }
          fs_extra_1.writeFileSync(filePath, file.content);
        }
        // save the settings file
        if (!(yield fs_extra_1.pathExists(path_1.default.dirname(settingsPath)))) {
          fs_extra_1.mkdirSync(path_1.default.dirname(settingsPath), { recursive: true });
        }
        yield fs_extra_1.writeJson(settingsPath, settings, { spaces: 4 });
        // copy bot and runtime into projFolder
        yield fs_extra_1.copy(srcTemplate, runtimeFolder);
      });
    this.getHistory = (botId, profileName) =>
      __awaiter(this, void 0, void 0, function* () {
        if (this.histories && this.histories[botId] && this.histories[botId][profileName]) {
          return this.histories[botId][profileName];
        }
        return [];
      });
    this.updateHistory = (botId, profileName, newHistory) =>
      __awaiter(this, void 0, void 0, function* () {
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
    this.createAndDeploy = (project, botId, profileName, jobId, resourcekey, customizeConfiguration) =>
      __awaiter(this, void 0, void 0, function* () {
        const { name, environment, hostname, luisResource, language } = customizeConfiguration;
        try {
          // Perform the deploy
          yield this.azDeployer.deploy(project, name, environment, language, hostname, luisResource);
          // update status and history
          const status = this.getLoadingStatus(botId, profileName, jobId);
          if (status) {
            status.status = 200;
            status.result.message = 'Success';
            status.result.log = this.logMessages.join('\n');
            yield this.updateHistory(botId, profileName, Object.assign({ status: status.status }, status.result));
            this.removeLoadingStatus(botId, profileName, jobId);
            yield this.cleanup(resourcekey);
          }
        } catch (error) {
          console.log(error);
          // update status and history
          const status = this.getLoadingStatus(botId, profileName, jobId);
          if (status) {
            status.status = 500;
            status.result.message = error ? error.message : 'publish error';
            status.result.log = this.logMessages.join('\n');
            yield this.updateHistory(botId, profileName, Object.assign({ status: status.status }, status.result));
            this.removeLoadingStatus(botId, profileName, jobId);
            yield this.cleanup(resourcekey);
          }
        }
      });
    /**************************************************************************************************
     * plugin methods
     *************************************************************************************************/
    this.publish = (config, project, metadata, user) =>
      __awaiter(this, void 0, void 0, function* () {
        // templatePath point to the dotnet code
        const {
          fullSettings,
          templatePath,
          profileName,
          subscriptionID,
          name,
          environment,
          hostname,
          luisResource,
          language,
          settings,
          accessToken,
        } = config;
        // point to the declarative assets (possibly in remote storage)
        const botFiles = project.files;
        // get the bot id from the project
        const botId = project.id;
        // generate an id to track this deploy
        const jobId = uuid_1.v4();
        // resource key to map to one provision resource
        const resourcekey = md5_1.default(
          [
            project.name,
            name,
            environment,
            settings === null || settings === void 0 ? void 0 : settings.MicrosoftAppPassword,
          ].join()
        );
        // If the project is using an "ejected" runtime, use that version of the code instead of the built-in template
        let runtimeCodePath = templatePath;
        if (
          project.settings &&
          project.settings.runtime &&
          project.settings.runtime.customRuntime === true &&
          project.settings.runtime.path
        ) {
          runtimeCodePath = project.settings.runtime.path;
        }
        yield this.init(botFiles, fullSettings, runtimeCodePath, resourcekey);
        try {
          // test creds, if not valid, return 500
          if (!accessToken) {
            throw new Error('Required field `accessToken` is missing from publishing profile.');
          }
          if (!settings) {
            throw new Error(
              'no successful created resource in Azure according to your config, please run provision script included in your bot project.'
            );
          }
          const customizeConfiguration = {
            subscriptionID,
            name,
            environment,
            hostname,
            luisResource,
            language,
          };
          // append provision resource into file
          // TODO: here is where we configure the template for the runtime, and should be parameterized when we
          // implement interchangeable runtimes
          const resourcePath = path_1.default.resolve(
            this.getProjectFolder(resourcekey, DEFAULT_RUNTIME),
            'appsettings.deployment.json'
          );
          const appSettings = yield fs_extra_1.readJson(resourcePath);
          yield fs_extra_1.writeJson(resourcePath, Object.assign(Object.assign({}, appSettings), settings), {
            spaces: 4,
          });
          this.azDeployer = new bot_deploy_1.BotProjectDeploy({
            subId: subscriptionID,
            logger: (msg) => {
              console.log(msg);
              this.logMessages.push(JSON.stringify(msg, null, 2));
            },
            accessToken: accessToken,
            projPath: this.getProjectFolder(resourcekey, DEFAULT_RUNTIME),
            runtime: plugin_loader_1.pluginLoader.getRuntime('csharp-azurefunctions'),
          });
          this.logMessages = ['Publish starting...'];
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
          this.createAndDeploy(project, botId, profileName, jobId, resourcekey, customizeConfiguration);
          return response;
        } catch (err) {
          console.log(err);
          this.logMessages.push(err.message);
          const response = {
            status: 500,
            result: {
              id: jobId,
              time: new Date(),
              message: 'Publish Fail',
              log: this.logMessages.join('\n'),
              comment: metadata.comment,
            },
          };
          this.updateHistory(botId, profileName, Object.assign({ status: response.status }, response.result));
          this.cleanup(resourcekey);
          return response;
        }
      });
    this.getStatus = (config, project, user) =>
      __awaiter(this, void 0, void 0, function* () {
        const profileName = config.profileName;
        const botId = project.id;
        // return latest status
        const status = this.getLoadingStatus(botId, profileName);
        if (status) {
          return status;
        } else {
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
    this.history = (config, project, user) =>
      __awaiter(this, void 0, void 0, function* () {
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
  }
  cleanup(resourcekey) {
    return __awaiter(this, void 0, void 0, function* () {
      const projFolder = this.getRuntimeFolder(resourcekey);
      yield fs_extra_1.emptyDir(projFolder);
      yield fs_extra_1.rmdir(projFolder);
    });
  }
  loadHistoryFromFile() {
    return __awaiter(this, void 0, void 0, function* () {
      if (yield fs_extra_1.pathExists(this.historyFilePath)) {
        this.histories = yield fs_extra_1.readJson(this.historyFilePath);
      }
    });
  }
}
const azurePublish = new AzurePublisher();
exports.default = (composer) =>
  __awaiter(void 0, void 0, void 0, function* () {
    yield composer.addPublishMethod(azurePublish, schema_1.default, instructions);
  });
//# sourceMappingURL=index.js.map
