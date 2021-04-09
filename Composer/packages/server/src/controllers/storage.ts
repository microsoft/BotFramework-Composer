// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Request, Response } from 'express';

import { ExtensionContext } from '../models/extension/extensionContext';
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
  res.status(200).json(StorageService.updateCurrentPath(req.body.path, req.body.storageId));
}

function validatePath(req: Request, res: Response) {
  console.log(req);
  res.status(200).json(StorageService.validatePath(req.params.path));
}

async function createFolder(req: Request, res: Response) {
  const path = req.body.path;
  const folderName = req.body.name;
  try {
    StorageService.createFolder(Path.join(path, folderName));
    res.status(200).json({ message: 'success' });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}

async function updateFolder(req: Request, res: Response) {
  const path = req.body.path;
  const oldFolderName = req.body.oldName;
  const newFolderName = req.body.newName;
  try {
    StorageService.updateFolder(path, oldFolderName, newFolderName);
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
    if (!Path.isAbsolute(reqpath)) {
      throw new Error('path must be absolute');
    }
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
