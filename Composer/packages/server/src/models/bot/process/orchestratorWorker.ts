// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileInfo } from '@bfc/shared';
import { LabelResolver, Orchestrator } from '@microsoft/bf-orchestrator';
import { writeFile } from 'fs-extra';

import { Path } from '../../../utility/path';
import { IOrchestratorBuildOutput } from '../interface';

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
