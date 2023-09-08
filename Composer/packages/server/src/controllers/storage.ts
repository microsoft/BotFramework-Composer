// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Request, Response } from 'express';

import { ExtensionContext } from '../models/extension/extensionContext';
import StorageService from '../services/storage';
import { Path } from '../utility/path';

async function getStorageConnections(req: Request, res: Response) {
  const user = await ExtensionContext.getUserFromRequest(req);
  res.status(200).json(StorageService.getStorageConnections(user));
}

async function createStorageConnection(req: Request, res: Response) {
  StorageService.createStorageConnection(req.body);
  const user = await ExtensionContext.getUserFromRequest(req);
  res.status(200).json(StorageService.getStorageConnections(user));
}

function updateCurrentPath(req: Request, res: Response) {
  res.status(200).json(StorageService.updateCurrentPath(req.body.path, req.body.storageId));
}

async function validatePath(req: Request, res: Response) {
  const storageId = 'default';
  const user = await ExtensionContext.getUserFromRequest(req);
  res.status(200).json({ errorMsg: await StorageService.validatePath(storageId, req.params.path, user) });
}

async function createFolder(req: Request, res: Response) {
  const path = req.body.path;
  const folderName = req.body.name;
  const storageId = req.params.storageId;
  const user = await ExtensionContext.getUserFromRequest(req);
  try {
    StorageService.createFolder(storageId, Path.join(path, folderName), user);
    res.status(200).json({ message: 'success' });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}

async function updateFolder(req: Request, res: Response) {
  const path = req.body.path;
  const oldFolderName = req.body.oldName;
  const newFolderName = req.body.newName;
  const storageId = req.params.storageId;
  const user = await ExtensionContext.getUserFromRequest(req);
  try {
    StorageService.updateFolder(storageId, path, oldFolderName, newFolderName, user);
    res.status(200).json({ message: 'success' });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}

async function getBlob(req: Request, res: Response) {
  const storageId = req.params.storageId;
  const user = await ExtensionContext.getUserFromRequest(req);

  try {
    if (!req.query.path) {
      throw new Error('path missing from query');
    }
    const reqpath = decodeURIComponent(req.query.path);
    res.status(200).json(await StorageService.getBlob(storageId, reqpath, user));
  } catch (e) {
    res.status(400).json({
      message: e instanceof Error ? e.message : e,
    });
  }
}

export const StorageController = {
  getStorageConnections,
  createStorageConnection,
  createFolder,
  updateFolder,
  getBlob,
  updateCurrentPath,
  validatePath,
};
