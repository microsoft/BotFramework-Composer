/* eslint @typescript-eslint/no-use-before-define:warn */
import express, { Router, Request, Response } from 'express';

import storage from '../storage/StorageService';
import StorageHandler, { IStorageItem } from '../handlers/storageHandler';

const router: Router = express.Router({});
const storageHandler = new StorageHandler(storage);

router.get('/:storageId?', async (req: Request, res: Response) => {
  try {
    let result;
    if (req.params.storageId) {
      result = storageHandler.getStorageById(req.params.storageId);
    } else {
      result = storageHandler.getStorage();
    }

    if (!result) {
      res.status(404).json();
    } else {
      res.status(200).json(result);
    }
  } catch (error) {
    res.status(400).json({ error: 'get storages error' });
  }
});

// add or update a storage
router.put('/', async (req: Request, res: Response) => {
  if (req.body as IStorageItem) {
    try {
      await storageHandler.addStorage(req.body);
      res.send('OK');
    } catch (error) {
      res.status(400).json(error);
    }
  } else {
    res.status(400).json('lack type or id');
  }
});

router.delete('/', async (req: Request, res: Response) => {
  try {
    await storageHandler.deleteStorage(req.body);
    res.send('OK');
  } catch (error) {
    res.status(400).json(error);
  }
});

// match absolute path
router.get('/:storageId/blobs/:path(*)', async (req: Request, res: Response) => {
  try {
    const result = await storageHandler.getFilesAndFolders(req.params);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json(error);
  }
});

export const storagesServerRouter: Router = router;
