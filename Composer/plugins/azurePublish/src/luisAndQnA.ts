// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as path from 'path';
import { promisify } from 'util';

import * as fs from 'fs-extra';
import * as rp from 'request-promise';
import { ILuisConfig, FileInfo, IQnAConfig } from '@bfc/shared';

import { ICrossTrainConfig, createCrossTrainConfig } from './utils/crossTrainUtil';
import { BotProjectDeployLoggerType } from './botProjectLoggerType';

const crossTrainer = require('@microsoft/bf-lu/lib/parser/cross-train/crossTrainer.js');
const luBuild = require('@microsoft/bf-lu/lib/parser/lubuild/builder.js');
const qnaBuild = require('@microsoft/bf-lu/lib/parser/qnabuild/builder.js');
const readdir: any = promisify(fs.readdir);

export interface PublishConfig {
  // Logger
  logger: (string) => any;
  projPath: string;
  [key: string]: any;
}

const INTERUPTION = 'interuption';

export class LuisAndQnaPublish {
  private logger: (string) => any;
  private remoteBotPath: string;
  private generatedFolder: string;
  private interruptionFolderPath: string;
  private crossTrainConfig: ICrossTrainConfig;

  constructor(config: PublishConfig) {
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
  private async getFiles(dir: string): Promise<string[]> {
    const dirents = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      dirents.map((dirent) => {
        const res = path.resolve(dir, dirent.name);
        return dirent.isDirectory() ? this.getFiles(res) : res;
      })
    );
    return Array.prototype.concat(...files);
  }

  /**
   * Helper function to get the appropriate account out of a list of accounts
   * @param accounts
   * @param filter
   */
  private getAccount(accounts: any, filter: string) {
    for (const account of accounts) {
      if (account.AccountName === filter) {
        return account;
      }
    }
  }

  private notEmptyModel(file: string) {
    return fs.readFileSync(file).length > 0;
  }

  private async createGeneratedDir() {
    if (!(await fs.pathExists(this.generatedFolder))) {
      await fs.mkdir(this.generatedFolder);
    }
  }

  private async setCrossTrainConfig(botName: string, dialogFiles: string[], luFiles: string[]) {
    const dialogs: { [key: string]: any }[] = [];
    for (const dialog of dialogFiles) {
      dialogs.push({
        id: dialog.substring(dialog.lastIndexOf('\\') + 1, dialog.length),
        isRoot: dialog.indexOf(path.join(this.remoteBotPath, 'dialogs')) === -1,
        content: fs.readJSONSync(dialog),
      });
    }
    const luFileInfos: FileInfo[] = luFiles.map((luFile) => {
      const fileStats = fs.statSync(luFile);
      return {
        name: luFile.substring(luFile.lastIndexOf('\\') + 1),
        content: fs.readFileSync(luFile, 'utf-8'),
        lastModified: fileStats.mtime.toString(),
        path: luFile,
        relativePath: luFile.substring(luFile.lastIndexOf(this.remoteBotPath) + 1),
      };
    });
    this.crossTrainConfig = createCrossTrainConfig(dialogs, luFileInfos);
  }
  private async writeCrossTrainFiles(crossTrainResult) {
    if (!(await fs.pathExists(this.interruptionFolderPath))) {
      await fs.mkdir(this.interruptionFolderPath);
    }
    crossTrainResult.forEach(async (value, key) => {
      const fileName = path.basename(key);
      const newFileId = path.join(this.interruptionFolderPath, fileName);
      await fs.writeFile(newFileId, value.Content);
    });
  }

  private async crossTrain(luFiles: string[], qnaFiles: string[]) {
    const luContents: { [key: string]: any }[] = [];
    const qnaContents: { [key: string]: any }[] = [];
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
    const result = await crossTrainer.crossTrain(luContents, qnaContents, this.crossTrainConfig);

    await this.writeCrossTrainFiles(result.luResult);
    await this.writeCrossTrainFiles(result.qnaResult);
  }

  private async cleanCrossTrain() {
    fs.rmdirSync(this.interruptionFolderPath, { recursive: true });
  }
  private async getInterruptionFiles() {
    const files = await this.getFiles(this.interruptionFolderPath);
    const interruptionLuFiles: string[] = [];
    const interruptionQnaFiles: string[] = [];
    files.forEach((file) => {
      if (file.endsWith('qna')) {
        interruptionQnaFiles.push(file);
      } else if (file.endsWith('lu')) {
        interruptionLuFiles.push(file);
      }
    });
    return { interruptionLuFiles, interruptionQnaFiles };
  }

  // Run through the lubuild process
  // This happens in the build folder, NOT in the original source folder
  private async publishLuis(
    name: string,
    environment: string,
    accessToken: string,
    language: string,
    luisSettings: ILuisConfig,
    interruptionLuFiles: string[],
    luisResource?: string
  ) {
    const { authoringKey: luisAuthoringKey, authoringRegion: luisAuthoringRegion } = luisSettings;
    let { endpoint: luisEndpoint, authoringEndpoint: luisAuthoringEndpoint } = luisSettings;

    // Instantiate the LuBuild object from the LU parsing library
    // This object is responsible for parsing the LU files and sending them to LUIS
    const builder = new luBuild.Builder((msg) =>
      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_INFO,
        message: msg,
      })
    );

    // Pass in the list of the non-empty LU files we got above...
    const loadResult = await builder.loadContents(
      interruptionLuFiles,
      language || 'en-us',
      environment || '',
      luisAuthoringRegion || ''
    );

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
    const buildResult = await builder.build(
      loadResult.luContents,
      loadResult.recognizers,
      luisAuthoringKey,
      luisAuthoringEndpoint,
      name,
      environment,
      language,
      true,
      false,
      loadResult.multiRecognizers,
      loadResult.settings,
      loadResult.crosstrainedRecognizers,
      'crosstrained'
    );

    // Write the generated files to the generated folder
    await builder.writeDialogAssets(buildResult, true, this.generatedFolder);

    this.logger({
      status: BotProjectDeployLoggerType.DEPLOY_INFO,
      message: `lubuild succeed`,
    });

    // Find any files that contain the name 'luis.settings' in them
    // These are generated by the LuBuild process and placed in the generated folder
    // These contain dialog-to-luis app id mapping
    const luisConfigFiles = (await this.getFiles(this.remoteBotPath)).filter((filename) =>
      filename.includes('luis.settings')
    );
    const luisAppIds: any = {};

    // Read in all the luis app id mappings
    for (const luisConfigFile of luisConfigFiles) {
      const luisSettings = await fs.readJson(luisConfigFile);
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
      } as rp.RequestPromiseOptions;
      const response = await rp.get(getAccountUri, options);

      // this should include an array of account info objects
      accountList = JSON.parse(response);
    } catch (err) {
      // handle the token invalid
      const error = JSON.parse(err.error);
      if (error?.error?.message && error?.error?.message.indexOf('access token expiry') > 0) {
        throw new Error(
          `Type: ${error?.error?.code}, Message: ${error?.error?.message}, run az account get-access-token, then replace the accessToken in your configuration`
        );
      } else {
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
        status: BotProjectDeployLoggerType.DEPLOY_INFO,
        message: `Assigning to luis app id: ${luisAppId}`,
      });

      const luisAssignEndpoint = `${luisEndpoint}/luis/api/v2.0/apps/${luisAppId}/azureaccounts`;
      const options = {
        body: account,
        json: true,
        headers: { Authorization: `Bearer ${accessToken}`, 'Ocp-Apim-Subscription-Key': luisAuthoringKey },
      } as rp.RequestPromiseOptions;
      const response = await rp.post(luisAssignEndpoint, options);

      // TODO: Add some error handling on this API call. As it is, errors will just throw by default and be caught by the catch all try/catch in the deploy method

      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_INFO,
        message: response,
      });
    }

    // The process has now completed.
    this.logger({
      status: BotProjectDeployLoggerType.DEPLOY_INFO,
      message: 'Luis Publish Success! ...',
    });

    // return the new settings that need to be added to the main settings file.
    return luisAppIds;
  }
  private async publishQna(
    name: string,
    environment: string,
    language: string,
    qnaSettings: IQnAConfig,
    interruptionQnaFiles: string[]
  ) {
    // eslint-disable-next-line prefer-const
    let { subscriptionKey } = qnaSettings;
    const authoringRegion = 'westus';
    // publishing luis
    const builder = new qnaBuild.Builder((msg) =>
      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_INFO,
        message: msg,
      })
    );

    const loadResult = await builder.loadContents(
      interruptionQnaFiles,
      name,
      environment || '',
      authoringRegion || '',
      language || ''
    );

    const endpoint = `https://${authoringRegion}.api.cognitive.microsoft.com/qnamaker/v4.0`;

    const buildResult = await builder.build(
      loadResult.qnaContents,
      loadResult.recognizers,
      subscriptionKey,
      endpoint,
      name,
      environment,
      language,
      loadResult.multiRecognizers,
      loadResult.settings,
      loadResult.crosstrainedRecognizers,
      'crosstrained'
    );
    await builder.writeDialogAssets(buildResult, true, this.generatedFolder);

    this.logger({
      status: BotProjectDeployLoggerType.DEPLOY_INFO,
      message: `qnabuild succeed`,
    });

    // Find any files that contain the name 'qnamaker.settings' in them
    // These are generated by the LuBuild process and placed in the generated folder
    // These contain dialog-to-luis app id mapping
    const qnaConfigFile = (await this.getFiles(this.remoteBotPath)).find((filename) =>
      filename.includes('qnamaker.settings')
    );
    const qna: any = {};

    // Read the qna settings
    if (qnaConfigFile) {
      const qnaConfig = await fs.readJson(qnaConfigFile);
      const endpointKey = await builder.getEndpointKeys(subscriptionKey, endpoint);
      Object.assign(qna, qnaConfig.qna, { endpointKey: endpointKey.primaryEndpointKey });
    }
    return qna;
  }

  // Run through the build process
  // This happens in the build folder, NOT in the original source folder
  public async publishLuisAndQna(
    name: string,
    environment: string,
    accessToken: string,
    language: string,
    luisSettings: ILuisConfig,
    qnaSettings: IQnAConfig,
    luisResource?: string
  ) {
    const { authoringKey, authoringRegion } = luisSettings;
    const { subscriptionKey } = qnaSettings;
    if ((authoringKey && authoringRegion) || subscriptionKey) {
      const botFiles = await this.getFiles(this.remoteBotPath);
      const luFiles = botFiles.filter((name) => {
        return name.endsWith('.lu') && this.notEmptyModel(name);
      });
      const qnaFiles = botFiles.filter((name) => {
        return name.endsWith('.qna') && this.notEmptyModel(name);
      });

      if (luFiles.length > 0 && !(authoringKey && authoringRegion)) {
        throw 'Should have luis authoringKey and authoringRegion when lu file not empty';
      }
      if (qnaFiles.length > 0 && !subscriptionKey) {
        throw 'Should have qna subscriptionKey when qna file not empty';
      }
      const dialogFiles = botFiles.filter((name) => {
        return name.endsWith('.dialog') && this.notEmptyModel(name);
      });

      await this.setCrossTrainConfig(name, dialogFiles, luFiles);
      await this.createGeneratedDir();
      await this.crossTrain(luFiles, qnaFiles);
      const { interruptionLuFiles, interruptionQnaFiles } = await this.getInterruptionFiles();
      const luisAppIds = await this.publishLuis(
        name,
        environment,
        accessToken,
        language,
        luisSettings,
        interruptionLuFiles,
        luisResource
      );
      const qnaConfig = await this.publishQna(name, environment, language, qnaSettings, interruptionQnaFiles);
      await this.cleanCrossTrain();
      return { luisAppIds, qnaConfig };
    }
  }
}
