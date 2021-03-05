// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileInfo } from '@bfc/shared';
import { LabelResolver, Orchestrator } from '@microsoft/bf-orchestrator';

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
  const result = await Orchestrator.buildAsync(
    modelPath,
    luObjects,
    orchestratorLabelResolvers,
    isDialog,
    '',
    null,
    fullEmbedding
  );
  return result;
}

const handleMessage = async (msg: RequestMsg) => {
  const { payload } = msg;
  try {
    switch (payload.type) {
      case 'build': {
        const { files, modelPath } = payload;
        const result = await orchestratorBuilder(files, modelPath);
        process.send?.({ id: msg.id, payload: result });
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
