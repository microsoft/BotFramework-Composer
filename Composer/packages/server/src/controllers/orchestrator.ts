// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Orchestrator } from '@microsoft/bf-orchestrator';
import { Request, Response } from 'express';
import { pathExists } from 'fs-extra';

import { IOrchestratorNLRList } from '../models/bot/interface';
import { Path } from '../utility/path';

enum DownloadState {
  STOPPED,
  ALREADYDOWNLOADED,
  DOWNLOADING,
}

interface ModelRequest {
  type: 'en_intent' | 'multilingual_intent';
  name: string;
}

let state: DownloadState = DownloadState.STOPPED;

const onProgress = (msg: string) => {
  state = DownloadState.DOWNLOADING;
};

const onFinish = (msg: string) => {
  state = DownloadState.STOPPED;
};

function isValidModelRequest(arg: any): arg is ModelRequest {
  return arg.type !== undefined && arg.name !== undefined;
}

async function getModelBasePath() {
  let appDataPath = '';
  if (process?.versions?.hasOwnProperty('electron')) {
    const { app } = await import('electron');
    appDataPath = app.getPath('appData');
  } else {
    appDataPath = process.env.APPDATA || process.env.HOME || '';
  }
  const baseModelPath = Path.resolve(appDataPath, 'BotFrameworkComposer', 'models');
  return baseModelPath;
}

async function getModelPath(modelName: string) {
  return Path.resolve(await getModelBasePath(), modelName.replace('.onnx', ''));
}

async function getModelList(): Promise<IOrchestratorNLRList> {
  return await Orchestrator.baseModelGetVersionsAsync();
}

async function status(req: Request, res: Response) {
  res.send(200, state);
}

async function downloadLanguageModel(req: Request, res: Response) {
  const modelData = req.body?.modelData;

  if (!isValidModelRequest(modelData)) {
    return res.sendStatus(400);
  }

  const modelList = await getModelList();
  let modelName: string;

  if (modelData?.name === 'default') {
    modelName = modelList.defaults[modelData.type];
  } else {
    if (!(modelData.name in modelList.models)) {
      throw new Error(`Invalid Model: ${modelData.name}`);
    }
    modelName = modelData.name;
  }

  const modelPath = await getModelPath(modelName);

  if (await pathExists(modelPath)) {
    state = DownloadState.ALREADYDOWNLOADED;
    return res.sendStatus(201);
  }

  res.send(200, '/orchestrator/status');

  state = DownloadState.DOWNLOADING;
  await Orchestrator.baseModelGetAsync(modelPath, modelName, onProgress, onFinish);
}

export const OrchestratorController = {
  downloadLanguageModel,
  status,
};
