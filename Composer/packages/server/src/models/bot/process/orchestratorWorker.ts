// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileInfo } from '@bfc/shared';
import { LabelResolver, Orchestrator } from '@microsoft/bf-orchestrator';
import { writeFile, readdir, readFile, pathExists, readJson } from 'fs-extra';
import { partition } from 'lodash';

import { Path } from '../../../utility/path';
import { IOrchestratorBuildOutput, IOrchestratorSettings } from '../interface';

import { RequestMsg } from './types';

export class LabelResolversCache {
  // use projectId to support multiple bots.
  projects: Map<string, Map<string, LabelResolver>> = new Map();

  public set(projectId: string, value: Map<string, LabelResolver>) {
    this.projects.set(projectId, value);
  }

  public get(projectId: string) {
    return this.projects.get(projectId) ?? new Map<string, LabelResolver>();
  }

  public removeProject(projectId: string) {
    this.projects.delete(projectId);
  }
}

const cache = new LabelResolversCache();

/**
 * Orchestrator: Warm up the LabelResolversCache if .blu files already exist.
 *
 * The Orchestrator build process is iterative - the results of every build are cached, and the cache
 * is used in subsequent builds to reduce the number of utterance embeddings that have to be re-calculated.
 *
 * However, if a user starts a new session of Composer and reopens the same bot project,
 * the caches will be empty and training will begin from scratch again.
 *
 * If a user has ever built a bot with Orchestrator, embeddings (in the form of .blu files) for each
 * utterance will be stored in the /generated folder.
 *
 * We warm up the LabelResolversCache with these blu files and pass this cache to the normal build
 * process.  Re-hydrating the cache from files is still cheaper than recalculating the embeddings from scratch.
 *
 * @param projectId
 * @param modelPath
 * @param storage
 * @param generatedFolderPath
 */
export async function warmUpCache(generatedFolderPath: string, projectId: string) {
  //warm up the cache only if it's empty...
  if (cache.get(projectId).size == 0) {
    if (!(await pathExists(generatedFolderPath))) {
      return false;
    }

    const bluFiles = (await readdir(generatedFolderPath)).filter((fileName) => fileName.endsWith('.blu'));

    //if there are blu file in the generated folders to hydrate with...
    if (bluFiles.length == 0) {
      return false;
    }

    const orchestratorSettingsPath = Path.resolve(generatedFolderPath, 'orchestrator.settings.json');
    if (!(await pathExists(orchestratorSettingsPath))) {
      return false;
    }

    //todo - typeguards and safety checks needed
    const orchestratorSettings: IOrchestratorSettings = await readJson(orchestratorSettingsPath);

    let [en_files, multilang_files] = partition(bluFiles, (f) => f.split('.')?.[1].startsWith('en'));

    let enLabelResolvers: Map<string, LabelResolver> = new Map();

    const enSnapShotData = await Promise.all(
      en_files.map(
        async (f) =>
          [f.replace('.blu', '.lu'), new Uint8Array(await readFile(Path.join(generatedFolderPath, f)))] as [
            string,
            Uint8Array
          ]
      )
    );

    if (orchestratorSettings.orchestrator?.models?.en) {
      try {
        enLabelResolvers = await Orchestrator.getLabelResolversAsync(
          orchestratorSettings.orchestrator.models.en,
          '',
          new Map(enSnapShotData),
          false
        );
      } catch (err) {}
    }

    //todo: reduce code duplication
    const multilangSnapShotData = await Promise.all(
      multilang_files.map(
        async (f) =>
          [f.replace('.blu', '.lu'), new Uint8Array(await readFile(Path.join(generatedFolderPath, f)))] as [
            string,
            Uint8Array
          ]
      )
    );

    let multiLangLabelResolvers: Map<string, LabelResolver> = new Map();

    if (orchestratorSettings.orchestrator?.models?.multilang) {
      try {
        multiLangLabelResolvers = await Orchestrator.getLabelResolversAsync(
          orchestratorSettings.orchestrator.models.multilang,
          '',
          new Map(multilangSnapShotData),
          false
        );
      } catch (err) {}
    }

    cache.set(projectId, new Map([...enLabelResolvers, ...multiLangLabelResolvers]));

    return true;
  }
  return false;
}

/**
 * Orchestrator: Build command to compile .lu files into Binary LU (.blu) snapshots.
 *
 * A snapshot (.blu file) is created per .lu supplied
 *
 * @param files - Array of FileInfo
 * @param modelPath - Path to NLR model folder
 * @param isDialog - Flag to toggle creation of Recognizer Dialogs (default: true)
 * @param fullEmbedding - Use larger embeddings and skip size optimization (default: false)
 * @returns An object containing snapshot bytes and recognizer dialogs for each .lu file
 */
export async function orchestratorBuilder(
  projectId: string,
  files: FileInfo[],
  modelPath: string,
  isDialog = true,
  fullEmbedding = false
): Promise<IOrchestratorBuildOutput> {
  const orchestratorLabelResolvers = cache.get(projectId);

  const luObjects = files
    .filter((fi) => fi.name.endsWith('.lu') && fi.content)
    .map((fi) => ({
      id: fi.name,
      content: fi.content,
    }));
  const result = await Orchestrator.buildAsync(
    modelPath,
    luObjects,
    orchestratorLabelResolvers,
    isDialog,
    '',
    null,
    fullEmbedding
  );
  cache.set(projectId, orchestratorLabelResolvers);
  return result;
}

export async function writeSnapshot(output: IOrchestratorBuildOutput, generatedFolderPath: string) {
  // write snapshot data into /generated folder
  const snapshots: Record<string, string> = {};
  for (const dialog of output.outputs) {
    const bluFilePath = Path.resolve(generatedFolderPath, dialog.id.replace('.lu', '.blu'));
    snapshots[dialog.id.replace('.lu', '').replace(/[-.]/g, '_')] = bluFilePath;

    await writeFile(bluFilePath, Buffer.from(dialog.snapshot));
  }
  return snapshots;
}

const handleMessage = async (msg: RequestMsg) => {
  const { payload } = msg;
  try {
    switch (payload.type) {
      case 'build': {
        const { files, modelPath, generatedFolderPath, projectId } = payload;
        const result = await orchestratorBuilder(projectId, files, modelPath);
        const snapshots = await writeSnapshot(result, generatedFolderPath);
        process.send?.({ id: msg.id, payload: snapshots });
        break;
      }
      case 'warmup': {
        const { generatedFolderPath, projectId } = payload;
        const done = await warmUpCache(generatedFolderPath, projectId);
        process.send?.({ id: msg.id, payload: done });
        break;
      }
    }
  } catch (error) {
    return { id: msg.id, error };
  }
};

process.on('message', async (msg: RequestMsg) => {
  try {
    handleMessage(msg);
  } catch (error) {
    process.send?.({ id: msg.id, error });
  }
});
