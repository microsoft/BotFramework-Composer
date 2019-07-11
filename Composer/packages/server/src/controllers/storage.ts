import { Request, Response } from 'express';

import StorageService from '../services/storage';
import { Path } from '../utility/path.js';
import { StorageError } from '../models/serverError/serverError';
function getStorageConnections(req: Request, res: Response) {
  res.status(200).json(StorageService.getStorageConnections());
}

function createStorageConnection(req: Request, res: Response) {
  StorageService.createStorageConnection(req.body);
  res.status(200).json(StorageService.getStorageConnections());
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
    res.status(400).json(
      new StorageError({
        message: e instanceof Error ? e.message : e,
        title: 'Get Blob Error',
        statusCode: 400,
      })
    );
  }
}

export const StorageController = {
  getStorageConnections,
  createStorageConnection,
  getBlob,
};
