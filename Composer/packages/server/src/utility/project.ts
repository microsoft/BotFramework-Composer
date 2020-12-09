// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as fs from 'fs';

import { remove } from 'fs-extra';
import { SchemaMerger } from '@microsoft/bf-dialog/lib/library/schemaMerger';
import formatMessage from 'format-message';
import { UserIdentity, LocationRef } from '@botframework-composer/types';

import { ExtensionContext } from '../models/extension/extensionContext';
import settings from '../settings';
import log from '../logger';
import AssetService from '../services/asset';
import { BotProject } from '../models/bot/botProject';
import { BackgroundProcessManager } from '../services/backgroundProcessManager';

import { Path } from './path';

export function getLocationRef(location: string, storageId: string, name: string) {
  // default the path to the default folder.
  let path = settings.botsFolder;
  // however, if path is specified as part of post body, use that one.
  // this allows developer to specify a custom home for their bot.
  if (location) {
    // validate that this path exists
    // prettier-ignore
    if (fs.existsSync(location)) { // lgtm [js/path-injection]
      path = location;
    }
  }
  const locationRef: LocationRef = {
    storageId,
    path: Path.resolve(path, name),
  };
  log('Attempting to create project at %s', path);
  return locationRef;
}

export async function getNewProjRef(
  templateDir: string,
  templateId: string,
  locationRef: LocationRef,
  user?: UserIdentity,
  locale?: string
) {
  const createFromRemoteTemplate = !!templateDir;
  let newProjRef;
  if (createFromRemoteTemplate) {
    log('Creating project from remote template at %s', templateDir);
    newProjRef = await AssetService.manager.copyRemoteProjectTemplateTo(templateDir, locationRef, user, locale);
    // clean up the temporary template directory -- fire and forget
    remove(templateDir);
  } else {
    log('Creating project from internal template %s', templateId);
    newProjRef = await AssetService.manager.copyProjectTemplateTo(templateId, locationRef, user, locale);
  }
  return newProjRef;
}

export async function ejectAndMerge(currentProject: BotProject, jobId: string) {
  if (currentProject.settings?.runtime?.customRuntime === true) {
    const runtime = ExtensionContext.getRuntimeByProject(currentProject);
    const runtimePath = currentProject.settings.runtime.path;

    if (!fs.existsSync(runtimePath)) {
      await runtime.eject(currentProject, currentProject.fileStorage);
    }

    // install all dependencies and build the app
    BackgroundProcessManager.updateProcess(jobId, 202, formatMessage('Building runtime'));
    await runtime.build(runtimePath, currentProject);

    const manifestFile = runtime.identifyManifest(currentProject.dataDir, currentProject.name);

    // run the merge command to merge all package dependencies from the template to the bot project
    BackgroundProcessManager.updateProcess(jobId, 202, formatMessage('Merging Packages'));
    const realMerge = new SchemaMerger(
      [manifestFile, '!**/imported/**', '!**/generated/**'],
      Path.join(currentProject.dataDir, 'schemas/sdk'),
      Path.join(currentProject.dataDir, 'dialogs/imported'),
      false,
      false,
      console.log,
      console.warn,
      console.error
    );

    await realMerge.merge();
  }
}
