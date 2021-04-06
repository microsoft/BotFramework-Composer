// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileInfo } from '@bfc/shared';
import { LabelResolver, Orchestrator } from '@microsoft/bf-orchestrator';
import { writeFile, readdir, readFile, pathExists, readJson } from 'fs-extra';
import partition from 'lodash/partition';

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

  public clear() {
    this.projects.clear();
  }
}

export const cache = new LabelResolversCache();

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
  //warm up the cache only if it's empty and we've built this bot before
  if (!(await pathExists(generatedFolderPath)) || cache.get(projectId).size > 0) {
    return false;
  }

  const bluFiles = (await readdir(generatedFolderPath)).filter((fileName) => fileName.endsWith('.blu'));

  if (!bluFiles.length) {
    return false;
  }

  const orchestratorSettingsPath = Path.resolve(generatedFolderPath, 'orchestrator.settings.json');
  if (!(await pathExists(orchestratorSettingsPath))) {
    return false;
  }

  // an implementation detail is that we need to use the right model to reproduce the right LabelResolvers
  // so we get the model versions from a pre-existing settings file, and split the files based on
  // language
  const orchestratorSettings: IOrchestratorSettings = await readJson(orchestratorSettingsPath);
  if (!orchestratorSettings?.orchestrator?.models || !orchestratorSettings?.orchestrator?.models) {
    return false;
  }

  const [enLuFiles, multiLangLuFiles] = partition(bluFiles, (f) => f.split('.')?.[1].startsWith('en'));

  const modelDatas = [
    { model: orchestratorSettings?.orchestrator?.models?.en, lang: 'en', luFiles: enLuFiles },
    { model: orchestratorSettings?.orchestrator?.models?.multilang, lang: 'multilang', luFiles: multiLangLuFiles },
  ];

  const [enMap, multilangMap] = await Promise.all(
    modelDatas.map(async (modelData) => {
      const snapshotData = await Promise.all(
        modelData.luFiles.map(
          async (f) =>
            [f.replace('.blu', '.lu'), new Uint8Array(await readFile(Path.join(generatedFolderPath, f)))] as [
              string,
              Uint8Array
            ]
        )
      );

      return modelData.model && snapshotData.length
        ? await Orchestrator.getLabelResolversAsync(modelData.model, '', new Map(snapshotData), false)
        : new Map<string, LabelResolver>();
    })
  );

  cache.set(projectId, new Map([...enMap, ...multilangMap]));

  return true;
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

  //if user has changed language model settings, invalidate cached embeddings for that dialog
  const keysToInvalidate: string[] = [];

  for (const [key, labelResolver] of orchestratorLabelResolvers.entries()) {
    //JSON.parse can throw - this is expected to be caught in the process message handler below.
    const modelName: string | undefined = JSON.parse(LabelResolver.getConfigJson(labelResolver))?.Name;

    if (modelName && modelName !== Path.basename(modelPath) + '.onnx') {
      keysToInvalidate.push(key);
    }
  }

  for (const key of keysToInvalidate) {
    orchestratorLabelResolvers.delete(key);
  }

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
