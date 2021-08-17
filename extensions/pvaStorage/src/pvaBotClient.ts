// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { basename, join, resolve } from 'path';

import { ensureFile, pathExists, unlink, writeFile } from 'fs-extra';
import fetch from 'node-fetch';

import {
  BotComponentResponse,
  BotComponentUpsertRequest,
  BotProjectMetadata,
  ObiFileModification,
  PVABotModel,
  PVAMetadata,
} from './types';
import { PVABotsCache } from './pvaBotsCache';
import { logger } from './logger';

const HARDCODED_TEST_DIR = resolve('C:\\Users\\tonya\\Desktop\\Git Projects\\test\\PULLED-FROM-PVA');

const TEMP_PVA_CONFIG = {
  baseUrl: 'https://bots.int.customercareintelligence.net/',
  baseUrl1: 'https://web.test.powerva.microsoft.com/',
  botId: '5392e29c-602c-42e8-a1f5-bfc76c442082',
  envId: '713fe2cd-176e-4a9d-82c7-3ed46b4a2ff8',
  tenantId: '72f988bf-86f1-41af-91ab-2d7cd011db47',
  token: '',
};
const PVA_TEST_APP_ID = 'a522f059-bb65-47c0-8934-7db6e5286414';

const getMinimalRootDialogContent = (botName: string) =>
  JSON.stringify({
    $kind: 'Microsoft.AdaptiveDialog',
    $designer: {
      name: botName || '', // should probably throw if botName is empty
      description: '',
      id: Math.random() * 1000 + 1,
    },
    autoEndDialog: true,
    defaultResultProperty: 'dialog.result',
    triggers: [],
    recognizer: {
      $kind: 'Microsoft.VirtualAgents.Recognizer',
      intents: [],
    },
    //generator: '<%= botName %>.lg',
    id: botName || '',
    //recognizer: '<%= botName %>.lu.qna',
  });

/** */
export class PVABotClient {
  private botModel: PVABotModel;
  private metadata: BotProjectMetadata;
  private projectPath = '';
  private projectId: string | undefined;
  private electronContext: any;

  constructor(id: string, metadata: BotProjectMetadata) {
    this.projectId = id;
    this.metadata = metadata;
    if (!this.metadata.additionalInfo) {
      throw new Error('Attempted to instantiate a PVABotClient without PVA Metadata.');
    }
  }

  /**
   * @param writeFiles Will write all the downloaded content files to disk
   */
  private async fetchBotAndCreateContentMap(writeFiles?: boolean) {
    if (!this.electronContext) {
      console.log('NO ELECTRON CONTEXT DETECTED');
      return;
    }

    const pvaMetadata = this.metadata.additionalInfo as PVAMetadata;
    const token = await this.electronContext.getAccessToken({
      targetResource: PVA_TEST_APP_ID,
    });
    token.accessToken = TEMP_PVA_CONFIG.token || token.accessToken;
    const url = `${pvaMetadata.baseUrl}api/botauthoring/v1/environments/${pvaMetadata.envId}/bots/${pvaMetadata.botId}/content/botcomponents?includeObiFiles=true`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        'Content-Type': 'application/json',
        'X-CCI-BotId': pvaMetadata.botId,
        'X-CCI-TenantId': pvaMetadata.tenantId,
      },
      body: JSON.stringify({ componentDeltaToken: this.botModel?.mostRecentContentSnapshot || '' }),
    });
    if (res.status === 200) {
      const data: BotComponentResponse = await res.json();

      this.botModel.mostRecentContentSnapshot = data.contentSnapshot;

      // construct the content map
      for (const change of data.obiFileChanges) {
        if (change.isDeleted) {
          if (writeFiles) {
            const filePath = join(this.projectPath, change.path);
            await unlink(filePath);
          }
          delete this.botModel.obiContentMap[change.path];
        } else {
          this.botModel.obiContentMap[change.path] = change.componentInfo;
          if (writeFiles) {
            const filePath = join(this.projectPath, change.path);
            console.log(`Writing ${filePath}...`);
            await ensureFile(filePath);
            await writeFile(filePath, change.fileContent);
            console.log(`${filePath} successfully written!`);
          }
        }
      }
      this.botModel.trackedUpdates = {};
      this.updateBotCache();
      await this.ensureRootDialog();
    } else {
      const error = await res.text();
      console.error(error);
    }
  }

  public async initialize(electronContext: any) {
    // TODO: should electronContext be passed into the constructor?
    this.electronContext = electronContext;
    this.projectPath = HARDCODED_TEST_DIR;
    // try to get the bot from the cache
    const cachedBot = PVABotsCache[this.projectId];
    if (cachedBot) {
      logger.log(`${this.projectId} already in the PVA cache. Using cached info.`);
      this.botModel = cachedBot;
    } else {
      // go download the bot and construct the content map
      this.initializeBotModel();
      logger.log(`${this.projectId} is not in the PVA cache. Downloading the bot and building content map.`);
      await this.fetchBotAndCreateContentMap(true);
    }
  }

  public trackWrite(path, content) {
    this.botModel.trackedUpdates[path] = {
      content,
      isDelete: false,
    };
    this.updateBotCache();
  }

  public trackDelete(path) {
    this.botModel.trackedUpdates[path] = {
      isDelete: true,
    };
    this.updateBotCache();
  }

  public async saveToPVA() {
    // check to see if there were any tracked changes
    const changedPaths = Object.keys(this.botModel.trackedUpdates).filter((changedPath) => {
      // only push up changes to .dialog, .lg, and .lu files -- PVA will throw an error for other types
      return !!changedPath && /\.(dialog|lg|lu)$/.test(changedPath);
    });
    if (changedPaths.length) {
      // construct the request
      const obiFileChanges: ObiFileModification[] = [];
      for (const obiPath of changedPaths) {
        // fill out the component info for the asset if available (newly created assets will not yet have any component info)
        const componentInfo = this.botModel.obiContentMap[obiPath] || null;
        const modification: ObiFileModification = {
          componentInfo,
          fileContent: this.botModel.trackedUpdates[obiPath].content || '',
          isDeleted: this.botModel.trackedUpdates[obiPath].isDelete,
          path: obiPath,
        };
        obiFileChanges.push(modification);
      }
      const request: BotComponentUpsertRequest = {
        obiFileChanges,
      };
      const pvaMetadata = this.metadata.additionalInfo as PVAMetadata;

      const token = await this.electronContext.getAccessToken({
        targetResource: PVA_TEST_APP_ID,
      });
      token.accessToken = TEMP_PVA_CONFIG.token || token.accessToken;
      const url = `${pvaMetadata.baseUrl}api/botauthoring/v1/environments/${pvaMetadata.envId}/bots/${pvaMetadata.botId}/content/botcomponents?includeObiFiles=true`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          'Content-Type': 'application/json',
          'X-CCI-BotId': pvaMetadata.botId,
          'X-CCI-TenantId': pvaMetadata.tenantId,
        },
        body: JSON.stringify(request),
      });
      if (res.status === 200) {
        // get an updated list of the bot's assets from PVA and rebuild the content map
        await this.fetchBotAndCreateContentMap(false);
      } else {
        const error = await res.text();
        console.error(error);
      }
    }
    // no-op if no changes
  }

  private updateBotCache() {
    if (this.projectId) {
      PVABotsCache[this.projectId] = { ...this.botModel };
    }
  }

  private initializeBotModel() {
    this.botModel = {
      obiContentMap: {},
      mostRecentContentSnapshot: '',
      pvaMetadata: this.metadata.additionalInfo as PVAMetadata,
      trackedUpdates: {},
    };
    this.updateBotCache();
  }

  private async ensureRootDialog() {
    // look for the placeholder root dialog
    const tempRootDialogPath = join(this.projectPath, 'temproot.dialog');
    const tempRootDialogExists = await pathExists(tempRootDialogPath);
    const botName = basename(this.projectPath);
    const rootDialogName = `${botName}.dialog`;
    const rootDialogPath = join(this.projectPath, rootDialogName);

    if (tempRootDialogExists) {
      // replace it with a real root dialog
      const rootDialogContent = getMinimalRootDialogContent(botName);
      await writeFile(rootDialogPath, rootDialogContent); // TODO: need to enforce utf-8?
      await unlink(tempRootDialogPath);
      logger.log(`Got rid of temp root dialog and wrote real dialog file at: ${rootDialogPath}`);
      this.botModel.obiContentMap[rootDialogPath] = undefined;
      // mark the change to be saved to PVA
      this.botModel.trackedUpdates[rootDialogPath] = {
        content: rootDialogContent,
        isDelete: false,
      };
      this.updateBotCache();
    }
  }
}
