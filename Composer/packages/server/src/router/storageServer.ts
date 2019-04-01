/* eslint @typescript-eslint/no-use-before-define:warn */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { URL } from 'url';

import express, { Router, Request, Response } from 'express';
import produce from 'immer';
import azure, { BlobService } from 'azure-storage';

import storage from '../storage/StorageService';
import { FileStorage } from '../storage/FileStorage';

const router: Router = express.Router({});
const fsStat = promisify(fs.stat);
const urlExp = new RegExp(/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?/);

// decouple all handlers for easy testing
export const storageHandler = {
  getStorage: (_storage: FileStorage) => {
    try {
      const storagesList = produce(_storage.getItem('linkedStorages', []), draft => {
        for (const item of draft) {
          if (item.type === 'LocalDrive') {
            // deal with relative path
            item.path = path.resolve(item.path);
            item.path = path.normalize(item.path);
          }
        }
      });
      return storagesList;
    } catch (error) {
      return error;
    }
  },
  getStorageById: (_storage: FileStorage, id: string) => {
    try {
      const storagesList: object[] = _storage.getItem('linkedStorages', []);

      const index = storagesList.findIndex((value: any) => {
        return value.id === id;
      });
      return index > -1 ? storagesList[index] : null;
    } catch (error) {
      return error;
    }
  },
  // addAzureStorage: (body: any) => {
  //   if (body.path) {

  //   }
  // },
  // get current layer files list
  getFolderTree: (folderPath: string) => {
    const folderTree = [] as object[];
    const items = fs.readdirSync(folderPath);
    for (const item of items) {
      try {
        const itemPath = path.join(folderPath, item);
        const tempStat = fs.statSync(itemPath);
        if (tempStat.isDirectory()) {
          folderTree.push({
            name: item,
            type: 'folder',
            path: itemPath,
            lastModified: tempStat.mtimeMs,
          });
        } else if (tempStat.isFile()) {
          folderTree.push({
            name: item,
            size: tempStat.size,
            type: 'file',
            lastModified: tempStat.mtimeMs,
            path: itemPath,
          });
        }
      } catch (error) {
        // log error, and continute getting the path which can access
        console.log(error);
        continue;
      }
    }
    return folderTree;
  },

  listContainers: async (blobService: BlobService) => {
    return new Promise((resolve, reject) => {
      blobService.listContainersSegmented(null as any, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve({ message: `${data.entries.length} containers`, containers: data.entries });
        }
      });
    });
  },

  listBlobs: async (blobService: BlobService, containerName: string) => {
    return new Promise((resolve, reject) => {
      blobService.listBlobsSegmented(containerName, null as any, (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log({ message: `${data.entries.length} blobs in '${containerName}'`, blobs: data.entries });
          resolve({ blobs: data.entries });
        }
      });
    });
  },

  getContainersOrBlobs: async (reqPath: string, account: string, key: string) => {
    if (!urlExp.test(reqPath)) {
      throw { statusCode: 400, error: 'path is not url' };
    }
    try {
      let result: any;
      const blobService = azure.createBlobService(account, key);
      const url = new URL(reqPath);
      if (url.pathname === '/') {
        result = await storageHandler.listContainers(blobService);
        result = result.containers ? result.containers : [];
      } else if (url.pathname !== '/') {
        result = await storageHandler.listBlobs(blobService, url.pathname.substring(1));
        result = result.blobs ? result.blobs : [];
      }
      return result;
    } catch (error) {
      throw error;
    }
  },

  getFilesAndFolders: async (req: Request, res: Response) => {
    let reqPath: string = req.params.path;
    const storageId: string = req.params.storageId;
    if (!reqPath) {
      res.status(400).json({ error: 'no path' });
      return;
    }
    let result: any;
    const current = storageHandler.getStorageById(storage, storageId);
    if (current.type === 'LocalDrive') {
      if (!path.isAbsolute(reqPath)) {
        res.status(400).json({ error: 'path is not absolute path' });
        return;
      }
      try {
        const stat = await fsStat(reqPath);
        reqPath = path.normalize(reqPath);
        if (stat.isFile()) {
          result = fs.readFileSync(reqPath, 'utf-8');
          result = JSON.parse(result);
        } else if (stat.isDirectory()) {
          const folderTree = storageHandler.getFolderTree(reqPath);
          result = {
            name: path.basename(reqPath),
            parent: path.dirname(reqPath),
            children: folderTree,
          };
        }
      } catch (error) {
        res.status(400).json(error);
        return;
      }
    } else if (current.type === 'AzureBlob') {
      try {
        result = await storageHandler.getContainersOrBlobs(reqPath, current.account, current.key);
      } catch (error) {
        res.status(error.statusCode).json(error);
      }
    }
    res.status(200).json(result);
    return;
  },
};

router.get('/:storageId?', async (req: Request, res: Response) => {
  try {
    let result;
    if (req.params.storageId) {
      result = storageHandler.getStorageById(storage, req.params.storageId);
    } else {
      result = storageHandler.getStorage(storage);
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: 'get storages error' });
  }
});

// router.post('/', async (req: Request, res: Response) => {
//   if (req.body.type && req.body.type === "AzureBlob") {
//     storageHandler.addAzureStorage(req.body);
//   }
// });
// match absolute path
router.get('/:storageId/blobs/:path(*)', storageHandler.getFilesAndFolders);

export const storagesServerRouter: Router = router;
