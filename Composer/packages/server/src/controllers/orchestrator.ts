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

async function getModelPath(modelName) {
  return Path.resolve(await getModelBasePath(), modelName.replace('.onnx', ''));
}

async function getModelList(): Promise<IOrchestratorNLRList> {
  return await Orchestrator.baseModelGetVersionsAsync();
}

let state: DownloadState = DownloadState.STOPPED;

interface DefaultModelRequest {
  type: 'en_intent' | 'multilingual_intent';
  name: string;
}

function isDefaultModelRequest(arg: any): arg is DefaultModelRequest {
  return arg !== undefined;
}

async function status(req: Request, res: Response) {
  res.send(200, state);
}

async function downloadLanguageModel(req: Request, res: Response) {
  const modelData = req.body?.modelData;

  if (!isDefaultModelRequest(modelData)) {
    res.sendStatus(400);
    return;
  }

  let modelName = '';

  if (modelData?.name === 'default') {
    const modelList = await getModelList();
    modelName = modelList.defaults[modelData.type];
  } else {
    modelName = modelData.name;
  }

  const modelPath = await getModelPath(modelName);

  if (await pathExists(modelPath)) {
    state = DownloadState.ALREADYDOWNLOADED;
    return res.sendStatus(201);
  }

  const onProgress = (msg: string) => {
    setTimeout(() => {
      state = DownloadState.DOWNLOADING;
    }, 20000);
  };

  const onFinish = (msg: string) => {
    state = DownloadState.STOPPED;
  };

  state = DownloadState.DOWNLOADING;

  setTimeout(async () => {
    await Orchestrator.baseModelGetAsync(modelPath, modelName, onProgress, onFinish);
  }, 0);

  return res.send(200, '/orchestrator/status');
}

export const OrchestratorController = {
  downloadLanguageModel,
  status,
};
