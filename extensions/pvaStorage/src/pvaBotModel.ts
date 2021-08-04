// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { join, resolve } from 'path';

import { ensureFile, unlink, writeFile } from 'fs-extra';
import fetch from 'node-fetch';

import {
  BotComponentResponse,
  BotComponentUpsertRequest,
  ComponentInfo,
  ContentUpdateMetadata,
  ObiFileModification,
} from './types';
import { PVABotsCache } from './pvaBotsCache';
import { logger } from './logger';

const tempContentsDir = resolve('C:\\Users\\tonya\\Desktop\\Git Projects\\test\\pva-temp');
const unzippedContentsPath = join(tempContentsDir, 'unzipped');

// this is an in-memory representation of a PVA bot's assets
export class PVABotModel {
  private projectPath = '';
  private projectId: string | undefined;
  /** Map of CDS asset path to CDS component info */
  private obiContentMap: Record<string, ComponentInfo> = {};
  private mostRecentContentSnapshot = '';
  private trackedUpdates: Record<string, ContentUpdateMetadata> = {};

  /**
   * @param writeFiles Will write all the downloaded content files to disk
   */
  private async fetchBotAndCreateContentMap(writeFiles?: boolean) {
    const res = await fetch('http://localhost:5009/api/new/content');
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
  }

  public async initialize(projectId: string) {
    this.projectPath = join(unzippedContentsPath, `composer-project-${projectId}`);
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

  public async saveToPVA() {
    // check to see if there were any tracked changes
    const changedPaths = Object.keys(this.trackedUpdates);
    if (changedPaths.length) {
      // construct the request
      const obiFileChanges: ObiFileModification[] = [];
      for (const obiPath of changedPaths) {
        // fill out the component info for the asset if available (newly created assets will not yet have any component info)
        const componentInfo = this.obiContentMap[obiPath];
        const modification: ObiFileModification = {
          componentInfo,
          isDeleted: this.trackedUpdates[obiPath].isDelete,
          fileContent: this.trackedUpdates[obiPath].content || '',
          path: obiPath,
        };
        obiFileChanges.push(modification);
      }
      const request: BotComponentUpsertRequest = {
        obiFileChanges,
      };

      // make the request
      await fetch('http://localhost:5009/api/new/content/save', {
        method: 'PUT',
        body: JSON.stringify(request),
        headers: { 'Content-Type': 'application/json' },
      });

      // get an updated list of the bot's assets from PVA and rebuild the content map
      await this.fetchBotAndCreateContentMap(false);
    }
    // no-op if no changes
  }
}
