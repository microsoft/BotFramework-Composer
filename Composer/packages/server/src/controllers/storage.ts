import { Request, Response } from 'express';

import StorageService from '../services/storage';

function getStorageConnections(req: Request, res: Response) {
  res.status(200).json(StorageService.getStorageConnections());
}

function createStorageConnection(req: Request, res: Response) {
  StorageService.createStorageConnection(req.body);
  res.status(200).json(StorageService.getStorageConnections());
}

function getBlob(req: Request, res: Response) {
  const storageId = req.params.storageId;
  const path = req.params.path;
  try {
    res.status(200).json(StorageService.getBlob(storageId, path));
  } catch (e) {
    res.status(400).json(e);
  }
}

export const StorageController = {
  getStorageConnections: getStorageConnections,
  createStorageConnection: createStorageConnection,
  getBlob: getBlob,
};
