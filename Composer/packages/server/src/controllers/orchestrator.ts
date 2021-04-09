// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Orchestrator } from '@microsoft/bf-orchestrator';
import { Request, Response } from 'express';
import { pathExists } from 'fs-extra';
import { OrchestratorModelRequest, DownloadState } from '@bfc/shared';

import { IOrchestratorNLRList } from '../models/bot/interface';
import { TelemetryService } from '../services/telemetry';
import { Path } from '../utility/path';

class OrchestratorController {
  private errorMsg: any;
  private state: DownloadState = DownloadState.STOPPED;

  private getModelBasePath = async () => {
    let appDataPath = '';
    if (process?.versions?.hasOwnProperty('electron')) {
      const { app } = await import('electron');
      appDataPath = app.getPath('appData');
    } else {
      appDataPath = process.env.APPDATA || process.env.HOME || '';
    }
    const baseModelPath = Path.resolve(appDataPath, 'BotFrameworkComposer', 'models');
    return baseModelPath;
  };

  private getModelPath = async (modelName: string) =>
    Path.resolve(await this.getModelBasePath(), modelName.replace('.onnx', ''));

  private getModelList = async (): Promise<IOrchestratorNLRList> => await Orchestrator.baseModelGetVersionsAsync();

  private isValidModelRequest(arg: any): arg is OrchestratorModelRequest {
    return arg.kind !== undefined && arg.name !== undefined;
  }

  public status = async (req: Request, res: Response) => {
    if (this.errorMsg) {
      res.status(400).send(this.errorMsg);
      return;
    }
    res.send(this.state);
  };

  public downloadLanguageModel = async (req: Request, res: Response) => {
    const modelData = req.body?.modelData;
    this.errorMsg = null;

    if (!this.isValidModelRequest(modelData)) {
      return res.sendStatus(400);
    }

    const modelList = await this.getModelList();
    let modelName: string;

    if (modelData?.name === 'default') {
      modelName = modelList.defaults[modelData.kind];
    } else {
      if (!(modelData.name in modelList.models)) {
        throw new Error(`Invalid Model: ${modelData.name}`);
      }
      modelName = modelData.name;
    }

    const modelPath = await this.getModelPath(modelName);

    if (await pathExists(modelPath)) {
      this.state = DownloadState.ALREADYDOWNLOADED;
      return res.sendStatus(201);
    }

    const onProgress = (msg: string) => {
      this.state = DownloadState.DOWNLOADING;
    };

    const onFinish = (msg: string) => {
      TelemetryService.endEvent('OrchestratorDownloadCompleted', 'OrchestratorDownloader');
      this.state = DownloadState.STOPPED;
    };

    res.send('/orchestrator/status');

    try {
      this.state = DownloadState.DOWNLOADING;
      TelemetryService.startEvent('OrchestratorDownloadStarted', 'OrchestratorDownloader');
      await Orchestrator.baseModelGetAsync(modelPath, modelName, onProgress, onFinish);
    } catch (err) {
      this.errorMsg = err;
      this.state = DownloadState.STOPPED;
    }
  };
}

export default new OrchestratorController();
