// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileInfo } from '@bfc/shared';
import { LabelResolver, Orchestrator } from '@microsoft/bf-orchestrator';
import { writeFile } from 'fs-extra';

import { Path } from '../../../utility/path';
import { IOrchestratorBuildOutput } from '../interface';

import { RequestMsg } from './types';

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
  files: FileInfo[],
  modelPath: string,
  isDialog = true,
  fullEmbedding = false
): Promise<IOrchestratorBuildOutput> {
  const orchestratorLabelResolvers = new Map<string, LabelResolver>();

  const luObjects = files
    .filter((fi) => fi.name.endsWith('.lu') && fi.content)
    .map((fi) => ({
      id: fi.name,
      content: fi.content,
    }));

  return await Orchestrator.buildAsync(
    modelPath,
    luObjects,
    orchestratorLabelResolvers,
    isDialog,
    '',
    null,
    fullEmbedding
  );
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
        const { files, modelPath, generatedFolderPath } = payload;
        const result = await orchestratorBuilder(files, modelPath);
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
