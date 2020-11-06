// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Request, Response } from 'express';
import { Builder } from '../models/bot/builder';
import { IOrchestratorProgress } from '../models/bot/interface';
import { IFileStorage } from '../models/storage/interface';
// import path from 'path';
import fs from 'fs';

// const userAgent = navigator.userAgent.toLowerCase();
// if (userAgent.indexOf(' electron/') > -1) {
//    // Electron-specific code
// }
// const modelPathPrefix = './models';

async function downloadModel(req: Request, res: Response) {
  try {
    let builder = new Builder('', {} as IFileStorage, 'en-us');

    // let nlrList = await builder.runOrchestratorNlrList();
    // let defaultNLR = nlrList.default;
    let modelPath = await builder.getModelPathAsync();

    if (!fs.existsSync(modelPath)) {
      let handler: IOrchestratorProgress = (status) => {
        console.log(status);
      };
      await builder.runOrchestratorNlrGet(
        modelPath,
        'pretrained.20200924.microsoft.dte.00.06.en.onnx',
        handler,
        handler
      );
    } else {
      console.log('already exists');
    }

    //let modelPath = path.join(modelPathPrefix, defaultNLR);
    // if (fs.existsSync(modelPath)) {
    //   console.log('already exists');
    // } else {
    //   await builder.runOrchestratorNlrGet(path.resolve(modelPath), defaultNLR, handler, handler);
    // }
    // await builder.runOrchestratorNlrGet(defaultNLR, handler, handler);

    return res.status(200);
  } catch (err) {
    return res.status(500).json({
      message: err instanceof Error ? err.message : err,
    });
  }
}

export const OrchestratorController = {
  downloadModel,
};
