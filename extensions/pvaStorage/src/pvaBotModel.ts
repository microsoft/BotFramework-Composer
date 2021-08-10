// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { join, resolve } from 'path';

import { ensureFile, unlink, writeFile } from 'fs-extra';
import fetch from 'node-fetch';

import {
  BotComponentResponse,
  BotComponentUpsertRequest,
  ComponentInfo,
  ContentModification,
  ContentUpdateMetadata,
  ObiFileModification,
} from './types';
import { PVABotsCache } from './pvaBotsCache';
import { logger } from './logger';

const tempContentsDir = resolve('C:\\Users\\tonya\\Desktop\\Git Projects\\test\\pva-temp');
const unzippedContentsPath = join(tempContentsDir, 'unzipped');

const HARDCODED_TEST_DIR = resolve('C:\\Users\\tonya\\Desktop\\Git Projects\\test\\PULLED-FROM-PVA');

const TEMP_PVA_CONFIG = {
  baseUrl: 'https://bots.int.customercareintelligence.net/',
  baseUrl1: 'https://web.test.powerva.microsoft.com/',
  botId: '5392e29c-602c-42e8-a1f5-bfc76c442082',
  envId: '713fe2cd-176e-4a9d-82c7-3ed46b4a2ff8',
  tenantId: '72f988bf-86f1-41af-91ab-2d7cd011db47',
  token:
    'eyJ0eXAiOiJKV1QiLCJyaCI6IjAuQWdBQXY0ajVjdkdHcjBHUnF5MTgwQkhiUjFud0lxVmx1OEJIaVRSOXR1VW9aQlFhQU5ZLiIsImFsZyI6IlJTMjU2IiwieDV0IjoibDNzUS01MGNDSDR4QlZaTEhUR3duU1I3NjgwIiwia2lkIjoibDNzUS01MGNDSDR4QlZaTEhUR3duU1I3NjgwIn0.eyJhdWQiOiJhNTIyZjA1OS1iYjY1LTQ3YzAtODkzNC03ZGI2ZTUyODY0MTQiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC83MmY5ODhiZi04NmYxLTQxYWYtOTFhYi0yZDdjZDAxMWRiNDcvIiwiaWF0IjoxNjI4NTUwODMzLCJuYmYiOjE2Mjg1NTA4MzMsImV4cCI6MTYyODU1NDczMywiYWNyIjoiMSIsImFpbyI6IkFYUUFpLzhUQUFBQXF0N0prOWE5NHJnQlE2N0xTQWpielB5MGNTSytzQ2Jxd2UyS21GNW5hSXRJRlpub0VMWVdQMXM1eXkvQy80UkpVdmhuVnFyM0F5emJkRkcwLzdwU3UxT3YzcHdlakdrSnkzaXhCTXRPRThPTU9tTituTGZrRDlRbXJyeXFnSm4wcit3cHhhRENZL3BQd0xWU05oUVFIQT09IiwiYW1yIjpbInB3ZCIsInJzYSIsIm1mYSJdLCJhcHBpZCI6ImE1MjJmMDU5LWJiNjUtNDdjMC04OTM0LTdkYjZlNTI4NjQxNCIsImFwcGlkYWNyIjoiMCIsImRldmljZWlkIjoiMjI5OWRmY2ItNzM0My00OTk4LTkyYzUtOWYyY2U2Y2Q5NjU0IiwiZmFtaWx5X25hbWUiOiJBbnppYW5vIiwiZ2l2ZW5fbmFtZSI6IlRvbnkiLCJpcGFkZHIiOiI3Ni4xMDQuMjQ4LjIzNCIsIm5hbWUiOiJUb255IEFuemlhbm8iLCJvaWQiOiIzODk4YjE0ZC02OThiLTQxMTQtOTNmOS02MWI3MDU0MDJkYmUiLCJvbnByZW1fc2lkIjoiUy0xLTUtMjEtMjEyNzUyMTE4NC0xNjA0MDEyOTIwLTE4ODc5Mjc1MjctMjU1NTIwMDQiLCJwdWlkIjoiMTAwMzNGRkY5RjM0QjYwRiIsInJoIjoiSSIsInNjcCI6IkFwcENhdGFsb2cuUmVhZFdyaXRlLkFsbCBBcHBsaWNhdGlvbi5SZWFkLkFsbCBHcm91cC5SZWFkLkFsbCBPcmdhbml6YXRpb24uUmVhZC5BbGwgVGVhbXNBcHBJbnN0YWxsYXRpb24uUmVhZFdyaXRlRm9yVGVhbSBVc2VyLlJlYWQuQWxsIiwic3ViIjoiSTByaUUyNk12Rmh5NkVoS0k1c0EwYUNUdDFwek1UTXRaY2I0NHlBSE1wdyIsInRpZCI6IjcyZjk4OGJmLTg2ZjEtNDFhZi05MWFiLTJkN2NkMDExZGI0NyIsInVuaXF1ZV9uYW1lIjoidG9hbnppYW5AbWljcm9zb2Z0LmNvbSIsInVwbiI6InRvYW56aWFuQG1pY3Jvc29mdC5jb20iLCJ1dGkiOiJHU1hjNUtxSEQwcWdXd0x2anZRRUFBIiwidmVyIjoiMS4wIn0.NhXdB3uVHKX2-FOzZUzYcyRLI-fnetxB2e-1fhtSAfCuKPZu3UwWctTqce0C4b-bHxzmyQDaSRIyBmKNseVADR8NmN9maOsRWEQC2av91b6gQEgnRxo0DkjQXF1LXsFjOvsmdSydxNVXbPO-vgFoynyhnA0smICerXOa3TiDjYUSbKBIsYiv1tgbLlhCdrNb_qqglADGmjX1eKChkVQa4Ih0P5gP6lwgvKwN5Y0WGwH4apEq0djwhLnCueBLA3w-PTYzHbsw90bytVn78UIHtHqlKXYNml44jW7CjRFJOQRzTUjGCqeRqJzuZWM5SDzd-MEOGUC4csNNvgJ71zUczQ',
};
const PVA_TEST_APP_ID = 'a522f059-bb65-47c0-8934-7db6e5286414';

// this is an in-memory representation of a PVA bot's assets
export class PVABotModel {
  private projectPath = '';
  private projectId: string | undefined;
  /** Map of CDS asset path to CDS component info */
  private obiContentMap: Record<string, ComponentInfo> = {};
  private mostRecentContentSnapshot = '';
  private trackedUpdates: Record<string, ContentUpdateMetadata> = {};
  private static _electronContext: any;

  /**
   * @param writeFiles Will write all the downloaded content files to disk
   */
  private async fetchBotAndCreateContentMap(writeFiles?: boolean) {
    if (!PVABotModel.electronContext) {
      console.log('NO ELECTRON CONTEXT DETECTED');
      return;
    }
    const token = await PVABotModel.electronContext.getAccessToken({
      targetResource: PVA_TEST_APP_ID,
    });
    token.accessToken = TEMP_PVA_CONFIG.token || token.accessToken;
    const url = `${TEMP_PVA_CONFIG.baseUrl}api/botauthoring/v1/environments/${TEMP_PVA_CONFIG.envId}/bots/${TEMP_PVA_CONFIG.botId}/content/botcomponents?includeObiFiles=true`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        'Content-Type': 'application/json',
        'X-CCI-BotId': TEMP_PVA_CONFIG.botId,
        'X-CCI-TenantId': TEMP_PVA_CONFIG.tenantId,
      },
      // TODO: make componentDeltaToken dynamic
      body: JSON.stringify({ componentDeltaToken: '' }),
    });
    if (res.status === 200) {
      // const res = await fetch('http://localhost:5009/api/new/content');
      const data: BotComponentResponse = await res.json();

      this.mostRecentContentSnapshot = data.contentSnapshot;
      console.log(this.mostRecentContentSnapshot);

      // construct the content map
      for (const change of data.obiFileChanges) {
        if (change.isDeleted) {
          if (writeFiles) {
            const filePath = join(this.projectPath, change.path);
            await unlink(filePath);
          }
          delete this.obiContentMap[change.path];
        } else {
          this.obiContentMap[change.path] = change.componentInfo;
          if (writeFiles) {
            const filePath = join(this.projectPath, change.path);
            console.log(`Writing ${filePath}...`);
            await ensureFile(filePath);
            await writeFile(filePath, change.fileContent);
            console.log(`${filePath} successfully written!`);
          }
        }
      }
      // update the cache
      PVABotsCache[this.projectId] = {
        mostRecentContentSnapshot: this.mostRecentContentSnapshot,
        obiContentMap: this.obiContentMap,
        trackedUpdates: {},
      };
    } else {
      const error = await res.text();
      console.error(error);
    }
  }

  // TODO: PVA creds need to be passed into this function
  public async initialize(projectId: string, electronContext: any) {
    // make auth accessible to all instances of PVABotModel
    if (!PVABotModel.electronContext) {
      PVABotModel.setElectronContext(electronContext);
    }
    //this.projectPath = join(unzippedContentsPath, `composer-project-${projectId}`);
    this.projectPath = HARDCODED_TEST_DIR;
    this.projectId = projectId;
    // try to get the bot from the cache
    const cachedBot = PVABotsCache[projectId];
    if (cachedBot) {
      logger.log(`${projectId} already in the PVA cache. Using cached info.`);
      this.obiContentMap = cachedBot.obiContentMap;
      this.mostRecentContentSnapshot = cachedBot.mostRecentContentSnapshot;
      this.trackedUpdates = cachedBot.trackedUpdates;
    } else {
      // go download the bot and construct the content map
      logger.log(`${projectId} is not in the PVA cache. Downloading the bot and building content map.`);
      await this.fetchBotAndCreateContentMap(true);
    }
  }

  public trackWrite(path, content) {
    this.trackedUpdates[path] = {
      content,
      isDelete: false,
    };
  }

  public trackDelete(path) {
    this.trackedUpdates[path] = {
      isDelete: true,
    };
  }

  public async saveToPVA(projectId: string) {
    // check to see if there were any tracked changes
    const changedPaths = Object.keys(this.trackedUpdates).filter((changedPath) => {
      // only push up changes to .dialog, .lg, and .lu files -- PVA will throw an error for other types
      return !!changedPath && /\.(dialog|lg|lu)$/.test(changedPath);
    });
    if (changedPaths.length) {
      // construct the request
      const obiFileChanges: ObiFileModification[] = [];
      for (const obiPath of changedPaths) {
        // fill out the component info for the asset if available (newly created assets will not yet have any component info)
        const componentInfo = this.obiContentMap[obiPath] || null;
        const modification: ObiFileModification = {
          componentInfo,
          fileContent: this.trackedUpdates[obiPath].content || '',
          isDeleted: this.trackedUpdates[obiPath].isDelete,
          path: obiPath,
        };
        obiFileChanges.push(modification);
      }
      const request: BotComponentUpsertRequest = {
        obiFileChanges,
      };

      // make the request
      // await fetch('http://localhost:5009/api/new/content/save', {
      //   method: 'PUT',
      //   body: JSON.stringify(request),
      //   headers: { 'Content-Type': 'application/json' },
      // });

      const token = await PVABotModel.electronContext.getAccessToken({
        targetResource: PVA_TEST_APP_ID,
      });
      token.accessToken = TEMP_PVA_CONFIG.token || token.accessToken;
      const url = `${TEMP_PVA_CONFIG.baseUrl}api/botauthoring/v1/environments/${TEMP_PVA_CONFIG.envId}/bots/${TEMP_PVA_CONFIG.botId}/content/botcomponents?includeObiFiles=true`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          'Content-Type': 'application/json',
          'X-CCI-BotId': TEMP_PVA_CONFIG.botId,
          'X-CCI-TenantId': TEMP_PVA_CONFIG.tenantId,
        },
        // TODO: make componentDeltaToken dynamic
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

  public static setElectronContext(context: any) {
    this._electronContext = context;
  }

  public static get electronContext() {
    return this._electronContext;
  }
}
