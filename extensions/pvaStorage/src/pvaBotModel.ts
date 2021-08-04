// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { join, resolve } from 'path';

import { ensureFile, writeFile } from 'fs-extra';
import fetch from 'node-fetch';
// import extractZip from 'extract-zip';

import { PVACredentials } from './pvaStorage';
import { BotComponentResponse, BotComponentUpsertRequest, ComponentInfo, ObiFileModification } from './types';

const tempContentsDir = resolve('C:\\Users\\tonya\\Desktop\\Git Projects\\test\\pva-temp');
//const zipTargetPath = join(tempContentsDir, 'contents.zip');
const unzippedContentsPath = join(tempContentsDir, 'unzipped');

type ContentUpdateInfo = {
  content?: string;
  isDelete: boolean;
};

// this is an in-memory representation of a PVA bot's assets
export class PVABotModel {
  private credentials: PVACredentials;
  private _path = '';
  /** Map of CDS asset path to CDS component info */
  private obiContentMap: Record<string, ComponentInfo> = {};
  private mostRecentContentSnapshot = '';
  private trackedUpdates: Record<string, ContentUpdateInfo> = {};

  // take PVA info from pvaStorage.ts and go fetch bot and map to model?
  constructor(credentials: PVACredentials) {
    this.credentials = credentials;
    console.log(this.credentials);
  }

  private async fetchBotUpdated(): Promise<void> {
    const botPath = join(unzippedContentsPath, `pvaBot-${Date.now().toString()}`);

    const res = await fetch('http://localhost:5009/api/new/content');
    const data: BotComponentResponse = await res.json();

    this.mostRecentContentSnapshot = data.contentSnapshot;
    console.log(this.mostRecentContentSnapshot);
    for (const change of data.obiFileChanges) {
      if (!change.isDeleted) {
        this.obiContentMap[change.path] = change.componentInfo;
        const filePath = join(botPath, change.path);
        console.log(`Writing ${filePath}...`);
        await ensureFile(filePath);
        await writeFile(filePath, change.fileContent);
        console.log(`${filePath} successfully written!`);
      }
    }
  }

  // TODO: fire this before performing any sort of operation on the model
  // private async fetchBot(): Promise<void> {
  //   ensureDirSync(tempContentsDir);

  //   // TODO: auth and hit actual PVA endpoint

  //   // go grab the zipped bot contents and write the .zip to disk
  //   const res = await fetch('http://localhost:5009/api/content');
  //   const ws = createWriteStream(zipTargetPath);
  //   await new Promise((resolve, reject) => {
  //     ws.on('finish', resolve);
  //     ws.on('error', reject);
  //     res.body?.pipe(ws);
  //   });

  //   // unpack the .zip
  //   const paths: string[] = [];
  //   const onEntry = (entry: any) => {
  //     paths.push(entry.fileName);
  //   };

  //   // TODO: name path based on bot name / id
  //   const botPath = join(unzippedContentsPath, `pvaBot-${Date.now().toString()}`);
  //   this._path = botPath;
  //   await extractZip(zipTargetPath, { dir: botPath, onEntry });
  //   //console.log(paths);

  //   // build a Record<path, content> dictionary of all the assets
  //   // paths.forEach(...)
  // }

  public async initialize() {
    await this.fetchBotUpdated();
  }

  public get path(): string {
    return this._path;
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
    }
    // no-op if no changes
  }
}
