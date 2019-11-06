// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Request, Response } from 'express';

import StorageService from '../services/storage';
import { Path } from '../utility/path';

function getStorageConnections(req: Request, res: Response) {
  res.status(200).json(StorageService.getStorageConnections());
}

function createStorageConnection(req: Request, res: Response) {
  StorageService.createStorageConnection(req.body);
  res.status(200).json(StorageService.getStorageConnections());
}

function updateCurrentPath(req: Request, res: Response) {
  StorageService.updateCurrentPath(req.body.path);
  res.status(200).json('success');
}

async function getBlob(req: Request, res: Response) {
  const storageId = req.params.storageId;
  const reqpath = decodeURI(req.params.path);
  try {
    if (!Path.isAbsolute(reqpath)) {
      throw new Error('path must be absolute');
    }
    res.status(200).json(await StorageService.getBlob(storageId, reqpath));
  } catch (e) {
    res.status(400).json({
      message: e instanceof Error ? e.message : e,
    });
  }
}

export const StorageController = {
  getStorageConnections,
  createStorageConnection,
  getBlob,
  updateCurrentPath,
};
