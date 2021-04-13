// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { join } from 'path';

import { pathExists, readJson, readdir, remove } from 'fs-extra';

import { appDataPath, localPublishPath } from './../settings/env';

// this function is used to clean the deleted bots in the extensions's cache
export const cleanHostedBots = async () => {
  try {
    if (!(await pathExists(appDataPath))) return;
    const envData = await readJson(appDataPath);

    if (!envData.projectLocationMap) return;
    const projects = envData.projectLocationMap;

    let localHostedBots: string[] = [];
    if (await pathExists(localPublishPath)) {
      localHostedBots = await readdir(localPublishPath);
    }

    localHostedBots.forEach((id) => {
      if (!projects[id]) {
        remove(join(localPublishPath, id));
      }
    });
  } catch (error) {
    //TODO: if we can't remove these hostedBots, do we need to show the error
  }
};
