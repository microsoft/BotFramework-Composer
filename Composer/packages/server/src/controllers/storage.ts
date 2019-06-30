import { Request, Response } from 'express';

import settings from '../settings/settings.json';
import StorageService from '../services/storage';
import { Path } from '../utility/path.js';

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
    res.status(400).json(e);
  }
}

async function getAllBots(req: Request, res: Response) {
  const storageId = 'default';
  const folderPath = Path.resolve(settings.development.defaultFolder);
  try {
    res.status(200).json(await StorageService.getBlob(storageId, folderPath));
  } catch (e) {
    res.status(400).json(e);
  }
}

export const StorageController = {
  getStorageConnections,
  createStorageConnection,
  getBlob,
  getAllBots,
};
